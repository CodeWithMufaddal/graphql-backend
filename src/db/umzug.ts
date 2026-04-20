import path from 'node:path';

import { SequelizeStorage, Umzug } from 'umzug';

import { sequelize } from './sequelize';

const runtimeExtension = __filename.endsWith('.ts') ? 'ts' : 'js';

export const migrator = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations', `*.${runtimeExtension}`),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'sequelize_meta',
    tableName: 'sequelize_meta',
  }),
  logger: undefined,
});

export const seeder = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'seeders', `*.${runtimeExtension}`),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'sequelize_seed_meta',
    tableName: 'sequelize_seed_meta',
  }),
  logger: undefined,
});

