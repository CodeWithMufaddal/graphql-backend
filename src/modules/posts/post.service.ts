import { Op } from 'sequelize';

import { NotFoundError } from '../../utils/errors';
import {
  buildPageEnvelope,
  normalizePagination,
} from '../../utils/pagination';
import { assertSortableField, normalizeSortInput } from '../../utils/sort';
import type { PageQueryOptionsInput } from '../shared';
import { findUserById } from '../users/user.repository';
import {
  User,
  buildPostOrder,
  createPost,
  findPostById,
  listCommentsForPostId,
  listPostsPage,
} from './post.repository';
import type { CreatePostInput, UpdatePostInput } from './post.validation';

const POST_SORT_FIELDS = ['id', 'title', 'body', 'user.name', 'user.username'];

export async function listPosts(options?: PageQueryOptionsInput) {
  const pageOptions = normalizePagination(options?.paginate);
  const { field, order } = normalizeSortInput(options?.sort, 'id');
  const sortField = assertSortableField(field, POST_SORT_FIELDS);
  const searchQuery = options?.search?.q?.trim();

  const result = await listPostsPage({
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
    order: buildPostOrder(sortField, order),
    distinct: true,
  });

  return buildPageEnvelope(result.rows, result.count, pageOptions);
}

export async function getPostById(id: string | number) {
  const post = await findPostById(id);

  if (!post) {
    throw new NotFoundError('Post not found.');
  }

  return post;
}

export async function listCommentsForPost(postId: number) {
  return listCommentsForPostId(postId);
}

export async function createPostRecord(
  input: CreatePostInput,
  fallbackUserId: number,
) {
  const userId = Number(input.userId ?? fallbackUserId);
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError('Post author not found.');
  }

  return createPost({
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
    const nextUser = await findUserById(Number(input.userId));

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
