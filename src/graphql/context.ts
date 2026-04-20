import type { Request } from 'express';

import { getCurrentUser } from '../modules/auth/auth.service';

export type GraphQLContext = Record<PropertyKey, unknown> & {
  requestId: string;
  currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
};

export async function buildGraphQLContext(
  request: Request,
): Promise<GraphQLContext> {
  return {
    requestId: request.requestId ?? 'unknown',
    currentUser: await getCurrentUser(request),
  };
}
