import {
  DataTypes,
  Model,
  type Sequelize,
} from 'sequelize';
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';

import type { Post } from './post.model';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare username: string;
  declare email: string;
  declare phone: string | null;
  declare website: string | null;
  declare passwordHash: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare posts?: NonAttribute<Post[]>;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password_hash',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'users',
      underscored: true,
      modelName: 'User',
    },
  );

  return User;
}
