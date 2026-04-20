import { Sequelize } from 'sequelize';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { initModels } from './models';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  logging: env.DATABASE_LOGGING
    ? (sql) => logger.debug('sql_query', { sql })
    : false,
});

export const models = initModels(sequelize);

