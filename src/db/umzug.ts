import path from 'node:path';

import { SequelizeStorage, Umzug } from 'umzug';

import { sequelize } from './sequelize';

function toGlobPath(...segments: string[]) {
  return path.join(...segments).replace(/\\/g, '/');
}

const migrationGlob = toGlobPath(__dirname, 'migrations', '*.{js,ts}');
const seederGlob = toGlobPath(__dirname, 'seeders', '*.{js,ts}');

export const migrator = new Umzug({
  migrations: {
    glob: migrationGlob,
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
    glob: seederGlob,
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    modelName: 'sequelize_seed_meta',
    tableName: 'sequelize_seed_meta',
  }),
  logger: undefined,
});
