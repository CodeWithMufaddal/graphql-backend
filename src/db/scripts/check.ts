import { logger } from '../../config/logger';
import { sequelize } from '../sequelize';

async function main() {
  try {
    await sequelize.authenticate();

    logger.info('Database connection is healthy.', {
      database: sequelize.getDatabaseName(),
    });
  } finally {
    await sequelize.close();
  }
}

void main().catch((error: unknown) => {
  logger.error('Database connection check failed.', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exitCode = 1;
});

