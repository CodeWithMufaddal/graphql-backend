import type { Sequelize } from 'sequelize';

import { Comment, initCommentModel } from './comment.model';
import { Post, initPostModel } from './post.model';
import { User, initUserModel } from './user.model';

let isInitialized = false;

export function initModels(sequelize: Sequelize) {
  if (isInitialized) {
    return { User, Post, Comment };
  }

  initUserModel(sequelize);
  initPostModel(sequelize);
  initCommentModel(sequelize);

  User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts',
  });

  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Post.hasMany(Comment, {
    foreignKey: 'postId',
    as: 'comments',
  });

  Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
  });

  isInitialized = true;

  return { User, Post, Comment };
}

