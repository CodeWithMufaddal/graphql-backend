import { Op } from 'sequelize';
import type { Order } from 'sequelize';

import { models } from '../../db/sequelize';
import { NotFoundError } from '../../utils/errors';
import {
  buildPageEnvelope,
  normalizePagination,
} from '../../utils/pagination';
import { assertSortableField, normalizeSortInput } from '../../utils/sort';

const { Comment, Post, User } = models;

const POST_SORT_FIELDS = ['id', 'title', 'body', 'user.name', 'user.username'];

interface PageQueryOptions {
  paginate?: {
    page?: number | null;
    limit?: number | null;
  } | null;
  search?: {
    q?: string | null;
  } | null;
  sort?: {
    field?: string | null;
    order?: 'ASC' | 'DESC' | null;
  } | null;
}

interface CreatePostInput {
  title: string;
  body: string;
  userId?: string | number | null;
}

interface UpdatePostInput {
  title?: string | null;
  body?: string | null;
  userId?: string | number | null;
}

function getPostOrder(field: string, order: 'ASC' | 'DESC') {
  switch (field) {
    case 'user.name':
      return [[{ model: User, as: 'user' }, 'name', order]] as Order;
    case 'user.username':
      return [[{ model: User, as: 'user' }, 'username', order]] as Order;
    default:
      return [[field, order]] as Order;
  }
}

export async function listPosts(options?: PageQueryOptions | null) {
  const pageOptions = normalizePagination(options?.paginate);
  const { field, order } = normalizeSortInput(options?.sort, 'id');
  const sortField = assertSortableField(field, POST_SORT_FIELDS);
  const searchQuery = options?.search?.q?.trim();

  const result = await Post.findAndCountAll({
    where: searchQuery
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchQuery}%` } },
            { body: { [Op.iLike]: `%${searchQuery}%` } },
            { '$user.name$': { [Op.iLike]: `%${searchQuery}%` } },
            { '$user.username$': { [Op.iLike]: `%${searchQuery}%` } },
          ],
        }
      : undefined,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'username', 'email', 'phone', 'website'],
      },
    ],
    limit: pageOptions.limit,
    offset: pageOptions.offset,
    order: getPostOrder(sortField, order),
    distinct: true,
  });

  return buildPageEnvelope(result.rows, result.count, pageOptions);
}

export async function getPostById(id: string | number) {
  const post = await Post.findByPk(Number(id), {
    include: [
      {
        model: User,
        as: 'user',
      },
    ],
  });

  if (!post) {
    throw new NotFoundError('Post not found.');
  }

  return post;
}

export async function listCommentsForPost(postId: number) {
  return Comment.findAll({
    where: { postId },
    order: [['id', 'ASC']],
  });
}

export async function createPostRecord(
  input: CreatePostInput,
  fallbackUserId: number,
) {
  const userId = Number(input.userId ?? fallbackUserId);
  const user = await User.findByPk(userId);

  if (!user) {
    throw new NotFoundError('Post author not found.');
  }

  return Post.create({
    title: input.title,
    body: input.body,
    userId,
  });
}

export async function updatePostRecord(id: string | number, input: UpdatePostInput) {
  const post = await getPostById(id);

  if (input.title !== undefined) {
    post.title = input.title ?? post.title;
  }

  if (input.body !== undefined) {
    post.body = input.body ?? post.body;
  }

  if (input.userId !== undefined && input.userId !== null) {
    const nextUser = await User.findByPk(Number(input.userId));

    if (!nextUser) {
      throw new NotFoundError('Post author not found.');
    }

    post.userId = nextUser.id;
  }

  await post.save();
  return post;
}

export async function deletePostRecord(id: string | number) {
  const post = await getPostById(id);
  await post.destroy();

  return {
    success: true,
    message: `Post ${post.id} deleted successfully.`,
  };
}
