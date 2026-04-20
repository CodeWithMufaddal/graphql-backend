import type { GraphQLModuleDefinition } from '../module.types';

export const systemGraphqlModule: GraphQLModuleDefinition = {
  name: 'system',
  typeDefs: /* GraphQL */ `
    type Query {
      health: ServiceHealth!
    }
  `,
  resolvers: {
    Query: {
      health: () => ({
        status: 'ok',
        uptimeSeconds: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    },
  },
};
