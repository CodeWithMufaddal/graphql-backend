import type { GraphQLError, GraphQLFormattedError } from 'graphql';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

export function formatGraphQLError(
  error: GraphQLError,
  requestId: string,
): GraphQLFormattedError {
  if (error.originalError instanceof AppError) {
    return {
      message: error.originalError.message,
      locations: error.locations,
      path: error.path,
      extensions: {
        code: error.originalError.code,
        statusCode: error.originalError.statusCode,
        details: error.originalError.details,
        requestId,
      },
    };
  }

  logger.error('Unhandled GraphQL error.', {
    requestId,
    message: error.message,
    stack: error.originalError instanceof Error ? error.originalError.stack : undefined,
  });

  return {
    message:
      env.NODE_ENV === 'production' ? 'Internal server error.' : error.message,
    locations: error.locations,
    path: error.path,
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      requestId,
    },
  };
}

