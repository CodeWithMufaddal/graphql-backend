import type { Options } from 'sequelize';

import { env } from '../config/env';
import { logger } from '../config/logger';

export const sequelizeConfig: Options = {
  dialect: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  logging: env.DATABASE_LOGGING
    ? (sql) => logger.debug('sql_query', { sql })
    : false,
  pool: {
    max: env.DATABASE_POOL_MAX,
    min: env.DATABASE_POOL_MIN,
    acquire: env.DATABASE_POOL_ACQUIRE_MS,
    idle: env.DATABASE_POOL_IDLE_MS,
  },
  dialectOptions: env.DATABASE_SSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : undefined,
  define: {
    underscored: true,
    freezeTableName: true,
  },
  retry: {
    max: 2,
  },
};

