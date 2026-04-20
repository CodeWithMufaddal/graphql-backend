import type { Request, Response } from 'express';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

const register = new Registry();

collectDefaultMetrics({ register });

export const graphQlRequestCounter = new Counter({
  name: 'graphql_requests_total',
  help: 'Total number of GraphQL requests handled by the API',
  labelNames: ['method', 'status_code'] as const,
  registers: [register],
});

export const graphQlRequestDurationMs = new Histogram({
  name: 'graphql_request_duration_ms',
  help: 'GraphQL request duration in milliseconds',
  labelNames: ['method', 'status_code'] as const,
  buckets: [25, 50, 100, 250, 500, 1000, 2000],
  registers: [register],
});

export async function metricsHandler(_request: Request, response: Response) {
  response.setHeader('Content-Type', register.contentType);
  response.end(await register.metrics());
}

