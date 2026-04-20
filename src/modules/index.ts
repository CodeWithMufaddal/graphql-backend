import type { GraphQLModuleDefinition } from './module.types';
import { authGraphqlModule } from './auth';
import { postsGraphqlModule } from './posts';
import { sharedGraphqlModule } from './shared';
import { systemGraphqlModule } from './system';
import { usersGraphqlModule } from './users';

export const graphqlModules: GraphQLModuleDefinition[] = [
  sharedGraphqlModule,
  systemGraphqlModule,
  authGraphqlModule,
  usersGraphqlModule,
  postsGraphqlModule,
];
