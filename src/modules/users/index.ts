import * as userRepository from './user.repository';
import * as userValidation from './user.validation';

export { usersGraphqlModule } from './user.graphql';
export { userRepository, userValidation };
export {
  createUserRecord,
  deleteUserRecord,
  getUserById,
  listPostsForUser,
  listUsers,
  updateUserRecord,
} from './user.service';
export {
  createUserInputSchema,
  updateUserInputSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from './user.validation';
