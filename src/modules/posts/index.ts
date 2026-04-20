import * as postRepository from './post.repository';
import * as postValidation from './post.validation';

export { postsGraphqlModule } from './post.graphql';
export { postRepository, postValidation };
export {
  createPostRecord,
  deletePostRecord,
  getPostById,
  listCommentsForPost,
  listPosts,
  updatePostRecord,
} from './post.service';
export {
  createPostInputSchema,
  updatePostInputSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from './post.validation';
