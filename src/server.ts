import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { sequelize } from './db/sequelize';

async function startServer() {
  await sequelize.authenticate();

  const server = app.listen(env.PORT, () => {
    logger.info('GraphQL backend is running.', {
      port: env.PORT,
      graphqlPath: env.GRAPHQL_PATH,
      nodeEnv: env.NODE_ENV,
    });
  });

  const shutdown = async (signal: string) => {
    logger.info('Shutting down server.', { signal });

    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

void startServer().catch((error: unknown) => {
  logger.error('Failed to start server.', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
