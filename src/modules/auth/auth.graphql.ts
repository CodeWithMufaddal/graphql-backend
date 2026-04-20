import type { GraphQLContext } from '../../graphql/context';
import { parseInput } from '../../utils/validation';
import type { GraphQLModuleDefinition } from '../module.types';

import { loginUser, registerUser } from './auth.service';
import { loginInputSchema, registerInputSchema } from './auth.validation';

export const authGraphqlModule: GraphQLModuleDefinition = {
  name: 'auth',
  typeDefs: /* GraphQL */ `
    type AuthPayload {
      token: String!
      user: User!
    }

    input RegisterInput {
      name: String!
      username: String!
      email: String!
      password: String!
      phone: String
      website: String
    }

    input LoginInput {
      email: String!
      password: String!
    }

    extend type Query {
      me: User
    }

    type Mutation {
      register(input: RegisterInput!): AuthPayload!
      login(input: LoginInput!): AuthPayload!
    }
  `,
  resolvers: {
    Query: {
      me: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
        context.currentUser,
    },
    Mutation: {
      register: async (_parent: unknown, args: { input: unknown }) =>
        registerUser(parseInput(registerInputSchema, args.input)),
      login: async (_parent: unknown, args: { input: unknown }) =>
        loginUser(parseInput(loginInputSchema, args.input)),
    },
  },
};
