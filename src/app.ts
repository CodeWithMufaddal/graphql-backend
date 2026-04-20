import compression from 'compression';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { graphqlHTTP } from 'express-graphql';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptionsDelegate } from './config/cors';
import { env } from './config/env';
import { logger, morganStream } from './config/logger';
import {
  graphQlRequestCounter,
  graphQlRequestDurationMs,
  metricsHandler,
} from './config/metrics';
import { buildGraphQLContext } from './graphql/context';
import { formatGraphQLError } from './graphql/formatError';
import { schema } from './graphql/schema';
import { AppError } from './utils/errors';
import { createRequestId } from './utils/request';

export const app = express();

app.use((request, response, next) => {
  const requestId = request.headers['x-request-id']?.toString() ?? createRequestId();
  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);
  next();
});

app.use(helmet());
app.use(cors(corsOptionsDelegate));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny', { stream: morganStream }));

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get(env.METRICS_PATH, metricsHandler);

app.use(env.GRAPHQL_PATH, (request, response, next) => {
  const stopTimer = graphQlRequestDurationMs.startTimer();

  response.on('finish', () => {
    const labels = {
      method: request.method,
      status_code: String(response.statusCode),
    };

    graphQlRequestCounter.inc(labels);
    stopTimer(labels);
  });

  next();
});

app.use(
  env.GRAPHQL_PATH,
  graphqlHTTP(async (request: Request) => {
    const context = await buildGraphQLContext(request);

    return {
      schema,
      context,
      graphiql: env.NODE_ENV !== 'production',
      customFormatErrorFn: (error) => formatGraphQLError(error, context.requestId),
    };
  }),
);

app.use(
  (
    error: Error,
    request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    const requestId = request.requestId ?? 'unknown';

    if (error instanceof AppError) {
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
          statusCode: error.statusCode,
          requestId,
          timestamp: new Date().toISOString(),
          details: error.details ?? null,
        },
      });
      return;
    }

    logger.error('Unhandled application error.', {
      requestId,
      message: error.message,
      stack: error.stack,
    });

    response.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          env.NODE_ENV === 'production'
            ? 'Internal server error.'
            : error.message,
        statusCode: 500,
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  },
);

