import type { User } from '../../db/models/user.model';
import type { GraphQLContext } from '../../graphql/context';
import { parseInput } from '../../utils/validation';
import { requireCurrentUser } from '../auth/auth.guard';
import type { GraphQLModuleDefinition } from '../module.types';
import {
  ensureNonEmptyInput,
  pageQueryOptionsSchema,
  toIsoString,
} from '../shared';

import {
  createUserRecord,
  deleteUserRecord,
  getUserById,
  listPostsForUser,
  listUsers,
  updateUserRecord,
} from './user.service';
import { createUserInputSchema, updateUserInputSchema } from './user.validation';

export const usersGraphqlModule: GraphQLModuleDefinition = {
  name: 'users',
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      name: String!
      username: String!
      email: String!
      phone: String
      website: String
      posts: [Post!]!
      createdAt: String!
      updatedAt: String!
    }

    type UserPage {
      meta: PageMeta!
      links: PageLinks!
      data: [User!]!
    }

    input CreateUserInput {
      name: String!
      username: String!
      email: String!
      phone: String
      website: String
      password: String
    }

    input UpdateUserInput {
      name: String
      username: String
      email: String
      phone: String
      website: String
      password: String
    }

    extend type Query {
      users(options: PageQueryOptions): UserPage!
      user(id: ID!): User
    }

    extend type Mutation {
      createUser(input: CreateUserInput!): User!
      updateUser(id: ID!, input: UpdateUserInput!): User!
      deleteUser(id: ID!): MutationResult!
    }
  `,
  resolvers: {
    Query: {
      users: async (_parent: unknown, args: { options?: unknown }) =>
        listUsers(parseInput(pageQueryOptionsSchema, args.options)),
      user: async (_parent: unknown, args: { id: string }) => getUserById(args.id),
    },
    Mutation: {
      createUser: async (_parent: unknown, args: { input: unknown }) =>
        createUserRecord(parseInput(createUserInputSchema, args.input)),
      updateUser: async (
        _parent: unknown,
        args: { id: string; input: unknown },
        context: GraphQLContext,
      ) => {
        requireCurrentUser(context.currentUser);
        const input = parseInput(updateUserInputSchema, args.input);
        ensureNonEmptyInput(input, 'user');
        return updateUserRecord(args.id, input);
      },
      deleteUser: async (
        _parent: unknown,
        args: { id: string },
        context: GraphQLContext,
      ) => {
        requireCurrentUser(context.currentUser);
        return deleteUserRecord(args.id);
      },
    },
    User: {
      posts: async (user: User) => listPostsForUser(user.id),
      createdAt: (user: User) => toIsoString(user.createdAt),
      updatedAt: (user: User) => toIsoString(user.updatedAt),
    },
  },
};
