import { Op } from 'sequelize';
import type { FindAndCountOptions } from 'sequelize';

import { models } from '../../db/sequelize';

const { User, Post } = models;

export async function findUserById(id: string | number) {
  return User.findByPk(Number(id));
}

export async function findUserByEmail(email: string) {
  return User.findOne({
    where: { email },
  });
}

export async function findUserByIdentity(
  criteria: {
    email?: string | undefined;
    username?: string | undefined;
  },
  excludeUserId?: number,
) {
  const conditions = [];

  if (criteria.email) {
    conditions.push({ email: criteria.email });
  }

  if (criteria.username) {
    conditions.push({ username: criteria.username });
  }

  if (conditions.length === 0) {
    return null;
  }

  return User.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: conditions },
        excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {},
      ],
    },
  });
}

export async function listUsersPage(options: FindAndCountOptions) {
  return User.findAndCountAll(options);
}

export async function listPostsForUserId(userId: number) {
  return Post.findAll({
    where: { userId },
    order: [['id', 'ASC']],
  });
}

export async function createUser(data: {
  name: string;
  username: string;
  email: string;
  phone: string | null;
  website: string | null;
  passwordHash: string | null;
}) {
  return User.create(data);
}
