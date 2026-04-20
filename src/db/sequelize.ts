import { Sequelize } from 'sequelize';

import { sequelizeConfig } from './config';
import { initModels } from './models';

export const sequelize = new Sequelize(sequelizeConfig);

export const models = initModels(sequelize);
