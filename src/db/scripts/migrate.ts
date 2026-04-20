import { logger } from '../../config/logger';
import { sequelize } from '../sequelize';
import { migrator } from '../umzug';

async function main() {
  const action = process.argv[2] ?? 'up';

  try {
    await sequelize.authenticate();

    if (action === 'down') {
      const executedMigrations = await migrator.executed();
      const [lastMigration] = [...executedMigrations].reverse();

      if (!lastMigration) {
        logger.info('No migration to roll back.');
        return;
      }

      await migrator.down({ to: lastMigration.name });
      logger.info('Rolled back migration.', { migration: lastMigration.name });
      return;
    }

    const migrations = await migrator.up();
    logger.info('Applied migrations.', {
      migrations: migrations.map((migration) => migration.name),
    });
  } finally {
    await sequelize.close();
  }
}

void main().catch((error: unknown) => {
  logger.error('Migration command failed.', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exitCode = 1;
});
