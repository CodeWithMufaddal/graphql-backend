export type GraphQLResolverMap = Record<string, Record<string, unknown>>;

export interface GraphQLModuleDefinition {
  name: string;
  typeDefs: string;
  resolvers: GraphQLResolverMap;
}
