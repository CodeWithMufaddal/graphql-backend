import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request } from 'express';

import { env } from '../../config/env';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdentity,
} from '../users/user.repository';

import type { LoginInput, RegisterInput } from './auth.validation';

interface AuthTokenPayload {
  sub: number;
  email: string;
  username: string;
}

function issueToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

async function ensureUniqueIdentity(email: string, username: string) {
  const existingUser = await findUserByIdentity({ email, username });

  if (!existingUser) {
    return;
  }

  if (existingUser.email === email) {
    throw new ConflictError('A user with this email already exists.');
  }

  throw new ConflictError('A user with this username already exists.');
}

export async function registerUser(input: RegisterInput) {
  await ensureUniqueIdentity(input.email, input.username);

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    name: input.name,
    username: input.username,
    email: input.email,
    passwordHash,
    phone: input.phone ?? null,
    website: input.website ?? null,
  });

  return {
    token: issueToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    }),
    user,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email);

  if (!user?.passwordHash) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  return {
    token: issueToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    }),
    user,
  };
}

export async function getCurrentUser(request: Request) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === 'string') {
      return null;
    }

    const userId = Number(payload.sub);

    if (Number.isNaN(userId)) {
      return null;
    }

    return findUserById(userId);
  } catch {
    return null;
  }
}
