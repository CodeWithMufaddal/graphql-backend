import type { Request } from 'express';

import { getCurrentUser } from '../modules/auth/auth.service';

export interface GraphQLContext {
  requestId: string;
  currentUser: Awaited<ReturnType<typeof getCurrentUser>>;
}

export async function buildGraphQLContext(
  request: Request,
): Promise<GraphQLContext> {
  return {
    requestId: request.requestId ?? 'unknown',
    currentUser: await getCurrentUser(request),
  };
}

