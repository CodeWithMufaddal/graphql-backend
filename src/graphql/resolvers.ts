import { graphqlModules } from '../modules';
import type { GraphQLResolverMap } from '../modules/module.types';

function mergeResolvers(): GraphQLResolverMap {
  return graphqlModules.reduce<GraphQLResolverMap>((mergedResolvers, moduleDef) => {
    for (const [typeName, typeResolvers] of Object.entries(moduleDef.resolvers)) {
      mergedResolvers[typeName] = {
        ...(mergedResolvers[typeName] ?? {}),
        ...typeResolvers,
      };
    }

    return mergedResolvers;
  }, {});
}

export const resolvers = mergeResolvers();
