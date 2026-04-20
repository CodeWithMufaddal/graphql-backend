import { models } from '../db/sequelize';
import { loginUser, registerUser } from '../modules/auth/auth.service';
import {
  createPostRecord,
  deletePostRecord,
  getPostById,
  listCommentsForPost,
  listPosts,
  updatePostRecord,
} from '../modules/posts/post.service';
import {
  createUserRecord,
  deleteUserRecord,
  getUserById,
  listPostsForUser,
  listUsers,
  requireCurrentUser,
  updateUserRecord,
} from '../modules/users/user.service';
import { AppError } from '../utils/errors';
import { parseInput } from '../utils/validation';

import type { GraphQLContext } from './context';
import {
  createPostInputSchema,
  createUserInputSchema,
  loginInputSchema,
  pageQueryOptionsSchema,
  registerInputSchema,
  updatePostInputSchema,
  updateUserInputSchema,
} from './validation';

const { Comment, User } = models;

function toIsoString(value: Date) {
  return value.toISOString();
}

function ensureNonEmptyObject(input: Record<string, unknown>, entityName: string) {
  if (Object.keys(input).length === 0) {
    throw new AppError(
      'VALIDATION_ERROR',
      `At least one ${entityName} field must be provided.`,
      422,
    );
  }
}

export const resolvers = {
  Query: {
    health: () => ({
      status: 'ok',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    me: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => context.currentUser,
    users: async (_parent: unknown, args: { options?: unknown }) =>
      listUsers(parseInput(pageQueryOptionsSchema, args.options)),
    user: async (_parent: unknown, args: { id: string }) => getUserById(args.id),
    posts: async (_parent: unknown, args: { options?: unknown }) =>
      listPosts(parseInput(pageQueryOptionsSchema, args.options)),
    post: async (_parent: unknown, args: { id: string }) => getPostById(args.id),
  },
  Mutation: {
    register: async (_parent: unknown, args: { input: unknown }) =>
      registerUser(parseInput(registerInputSchema, args.input)),
    login: async (_parent: unknown, args: { input: unknown }) =>
      loginUser(parseInput(loginInputSchema, args.input)),
    createUser: async (_parent: unknown, args: { input: unknown }) =>
      createUserRecord(parseInput(createUserInputSchema, args.input)),
    updateUser: async (
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      requireCurrentUser(context.currentUser);
      const input = parseInput(updateUserInputSchema, args.input);
      ensureNonEmptyObject(input, 'user');
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
    createPost: async (
      _parent: unknown,
      args: { input: unknown },
      context: GraphQLContext,
    ) => {
      const currentUser = requireCurrentUser(context.currentUser);
      return createPostRecord(
        parseInput(createPostInputSchema, args.input),
        currentUser.id,
      );
    },
    updatePost: async (
      _parent: unknown,
      args: { id: string; input: unknown },
      context: GraphQLContext,
    ) => {
      requireCurrentUser(context.currentUser);
      const input = parseInput(updatePostInputSchema, args.input);
      ensureNonEmptyObject(input, 'post');
      return updatePostRecord(args.id, input);
    },
    deletePost: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireCurrentUser(context.currentUser);
      return deletePostRecord(args.id);
    },
  },
  User: {
    posts: async (user: InstanceType<typeof User>) => listPostsForUser(user.id),
    createdAt: (user: InstanceType<typeof User>) => toIsoString(user.createdAt),
    updatedAt: (user: InstanceType<typeof User>) => toIsoString(user.updatedAt),
  },
  Post: {
    user: async (post: { user?: InstanceType<typeof User>; userId: number }) =>
      post.user ?? getUserById(post.userId),
    comments: async (post: { id: number }) => listCommentsForPost(post.id),
    createdAt: (post: { createdAt: Date }) => toIsoString(post.createdAt),
    updatedAt: (post: { updatedAt: Date }) => toIsoString(post.updatedAt),
  },
  Comment: {
    post: async (comment: InstanceType<typeof Comment>) => getPostById(comment.postId),
    createdAt: (comment: InstanceType<typeof Comment>) =>
      toIsoString(comment.createdAt),
    updatedAt: (comment: InstanceType<typeof Comment>) =>
      toIsoString(comment.updatedAt),
  },
};

