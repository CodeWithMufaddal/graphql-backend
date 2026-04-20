import { graphqlModules } from '../modules';

export const typeDefs = graphqlModules.map((moduleDef) => moduleDef.typeDefs);
