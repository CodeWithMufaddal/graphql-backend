import { UnauthorizedError } from '../../utils/errors';

export function requireCurrentUser<TUser extends { id: number } | null>(
  currentUser: TUser,
): Exclude<TUser, null> {
  if (!currentUser) {
    throw new UnauthorizedError();
  }

  return currentUser as Exclude<TUser, null>;
}
