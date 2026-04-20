import { Op } from 'sequelize';

import { models } from '../../db/sequelize';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors';
import {
  buildPageEnvelope,
  normalizePagination,
} from '../../utils/pagination';
import { assertSortableField, normalizeSortInput } from '../../utils/sort';
import { hashPassword } from '../auth/auth.service';

const { User, Post } = models;

const USER_SORT_FIELDS = ['id', 'name', 'username', 'email', 'phone', 'website'];

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

interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  password?: string | null;
}

interface UpdateUserInput {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  password?: string | null;
}

async function ensureIdentityAvailable(
  email: string | undefined,
  username: string | undefined,
  excludeUserId?: number,
) {
  if (!email && !username) {
    return;
  }

  const conditions = [];

  if (email) {
    conditions.push({ email });
  }

  if (username) {
    conditions.push({ username });
  }

  const existingUser = await User.findOne({
    where: {
      [Op.and]: [
        { [Op.or]: conditions },
        excludeUserId ? { id: { [Op.ne]: excludeUserId } } : {},
      ],
    },
  });

  if (!existingUser) {
    return;
  }

  if (email && existingUser.email === email) {
    throw new ConflictError('A user with this email already exists.');
  }

  throw new ConflictError('A user with this username already exists.');
}

export async function listUsers(options?: PageQueryOptions | null) {
  const pageOptions = normalizePagination(options?.paginate);
  const { field, order } = normalizeSortInput(options?.sort, 'id');
  const sortField = assertSortableField(field, USER_SORT_FIELDS);
  const searchQuery = options?.search?.q?.trim();

  const where = searchQuery
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchQuery}%` } },
          { username: { [Op.iLike]: `%${searchQuery}%` } },
          { email: { [Op.iLike]: `%${searchQuery}%` } },
          { phone: { [Op.iLike]: `%${searchQuery}%` } },
          { website: { [Op.iLike]: `%${searchQuery}%` } },
        ],
      }
    : undefined;

  const result = await User.findAndCountAll({
    where,
    limit: pageOptions.limit,
    offset: pageOptions.offset,
    order: [[sortField, order]],
  });

  return buildPageEnvelope(result.rows, result.count, pageOptions);
}

export async function getUserById(id: string | number) {
  const user = await User.findByPk(Number(id));

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return user;
}

export async function listPostsForUser(userId: number) {
  return Post.findAll({
    where: { userId },
    order: [['id', 'ASC']],
  });
}

export async function createUserRecord(input: CreateUserInput) {
  await ensureIdentityAvailable(input.email, input.username);

  return User.create({
    name: input.name,
    username: input.username,
    email: input.email,
    phone: input.phone ?? null,
    website: input.website ?? null,
    passwordHash: input.password ? await hashPassword(input.password) : null,
  });
}

export async function updateUserRecord(id: string | number, input: UpdateUserInput) {
  const user = await getUserById(id);

  await ensureIdentityAvailable(input.email ?? undefined, input.username ?? undefined, user.id);

  if (input.name !== undefined) {
    user.name = input.name ?? user.name;
  }

  if (input.username !== undefined) {
    user.username = input.username ?? user.username;
  }

  if (input.email !== undefined) {
    user.email = input.email ?? user.email;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone ?? null;
  }

  if (input.website !== undefined) {
    user.website = input.website ?? null;
  }

  if (input.password) {
    user.passwordHash = await hashPassword(input.password);
  }

  await user.save();
  return user;
}

export async function deleteUserRecord(id: string | number) {
  const user = await getUserById(id);
  await user.destroy();

  return {
    success: true,
    message: `User ${user.id} deleted successfully.`,
  };
}

export function requireCurrentUser<TUser extends { id: number } | null>(
  currentUser: TUser,
): Exclude<TUser, null> {
  if (!currentUser) {
    throw new UnauthorizedError();
  }

  return currentUser as Exclude<TUser, null>;
}

