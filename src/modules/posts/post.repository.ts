import type { FindAndCountOptions, Order } from 'sequelize';

import { models } from '../../db/sequelize';

const { Comment, Post, User } = models;

export function buildPostOrder(field: string, order: 'ASC' | 'DESC') {
  switch (field) {
    case 'user.name':
      return [[{ model: User, as: 'user' }, 'name', order]] as Order;
    case 'user.username':
      return [[{ model: User, as: 'user' }, 'username', order]] as Order;
    default:
      return [[field, order]] as Order;
  }
}

export async function listPostsPage(options: FindAndCountOptions) {
  return Post.findAndCountAll(options);
}

export async function findPostById(id: string | number) {
  return Post.findByPk(Number(id), {
    include: [
      {
        model: User,
        as: 'user',
      },
    ],
  });
}

export async function listCommentsForPostId(postId: number) {
  return Comment.findAll({
    where: { postId },
    order: [['id', 'ASC']],
  });
}

export async function createPost(data: {
  title: string;
  body: string;
  userId: number;
}) {
  return Post.create(data);
}

export { User };
