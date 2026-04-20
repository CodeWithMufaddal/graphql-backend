import { logger } from '../../config/logger';
import { sequelize } from '../sequelize';
import { seeder } from '../umzug';

async function main() {
  const action = process.argv[2] ?? 'up';

  try {
    await sequelize.authenticate();

    if (action === 'down') {
      const executedSeeders = await seeder.executed();
      const [lastSeeder] = [...executedSeeders].reverse();

      if (!lastSeeder) {
        logger.info('No seed to roll back.');
        return;
      }

      await seeder.down({ to: lastSeeder.name });
      logger.info('Rolled back seed.', { seed: lastSeeder.name });
      return;
    }

    const seeds = await seeder.up();
    logger.info('Applied seeds.', {
      seeds: seeds.map((seed) => seed.name),
    });
  } finally {
    await sequelize.close();
  }
}

void main().catch((error: unknown) => {
  logger.error('Seed command failed.', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exitCode = 1;
});

