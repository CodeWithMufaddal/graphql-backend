import type { Comment } from '../../db/models/comment.model';
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
import { getUserById } from '../users/user.service';

import {
  createPostRecord,
  deletePostRecord,
  getPostById,
  listCommentsForPost,
  listPosts,
  updatePostRecord,
} from './post.service';
import { createPostInputSchema, updatePostInputSchema } from './post.validation';

export const postsGraphqlModule: GraphQLModuleDefinition = {
  name: 'posts',
  typeDefs: /* GraphQL */ `
    type Post {
      id: ID!
      title: String!
      body: String!
      user: User!
      comments: [Comment!]!
      createdAt: String!
      updatedAt: String!
    }

    type Comment {
      id: ID!
      name: String!
      email: String!
      body: String!
      post: Post!
      createdAt: String!
      updatedAt: String!
    }

    type PostPage {
      meta: PageMeta!
      links: PageLinks!
      data: [Post!]!
    }

    input CreatePostInput {
      title: String!
      body: String!
      userId: ID
    }

    input UpdatePostInput {
      title: String
      body: String
      userId: ID
    }

    extend type Query {
      posts(options: PageQueryOptions): PostPage!
      post(id: ID!): Post
    }

    extend type Mutation {
      createPost(input: CreatePostInput!): Post!
      updatePost(id: ID!, input: UpdatePostInput!): Post!
      deletePost(id: ID!): MutationResult!
    }
  `,
  resolvers: {
    Query: {
      posts: async (_parent: unknown, args: { options?: unknown }) =>
        listPosts(parseInput(pageQueryOptionsSchema, args.options)),
      post: async (_parent: unknown, args: { id: string }) => getPostById(args.id),
    },
    Mutation: {
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
        ensureNonEmptyInput(input, 'post');
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
    Post: {
      user: async (post: { user?: User; userId: number }) =>
        post.user ?? getUserById(post.userId),
      comments: async (post: { id: number }) => listCommentsForPost(post.id),
      createdAt: (post: { createdAt: Date }) => toIsoString(post.createdAt),
      updatedAt: (post: { updatedAt: Date }) => toIsoString(post.updatedAt),
    },
    Comment: {
      post: async (comment: Comment) => getPostById(comment.postId),
      createdAt: (comment: Comment) => toIsoString(comment.createdAt),
      updatedAt: (comment: Comment) => toIsoString(comment.updatedAt),
    },
  },
};
