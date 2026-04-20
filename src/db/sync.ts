import { env } from '../config/env';
import { logger } from '../config/logger';

import { sequelize } from './sequelize';

export async function syncSchemaIfEnabled() {
  const mode = env.DATABASE_SCHEMA_SYNC_MODE;

  if (mode === 'off') {
    return;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_SCHEMA_SYNC_MODE must be "off" in production to avoid destructive schema changes.',
    );
  }

  if (mode === 'force') {
    await sequelize.sync({ force: true });
    logger.warn('Schema sync completed with force mode.', { mode });
    return;
  }

  if (mode === 'alter_drop') {
    await sequelize.sync({ alter: { drop: true } });
    logger.warn('Schema sync completed with alter_drop mode.', { mode });
    return;
  }

  await sequelize.sync({ alter: { drop: false } });
  logger.warn('Schema sync completed with alter mode.', { mode });
}
