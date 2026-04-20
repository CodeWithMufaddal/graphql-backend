import type { GraphQLModuleDefinition } from '../module.types';

export const sharedGraphqlModule: GraphQLModuleDefinition = {
  name: 'shared',
  typeDefs: /* GraphQL */ `
    enum SortOrder {
      ASC
      DESC
    }

    input PaginateInput {
      page: Int
      limit: Int
    }

    input SearchInput {
      q: String
    }

    input SortInput {
      field: String
      order: SortOrder
    }

    input SliceInput {
      start: Int
      end: Int
    }

    input OperatorInput {
      field: String!
      operator: String!
      value: String
    }

    input PageQueryOptions {
      paginate: PaginateInput
      search: SearchInput
      sort: SortInput
      slice: SliceInput
      operators: [OperatorInput!]
    }

    type PageLink {
      page: Int!
      limit: Int!
    }

    type PageLinks {
      first: PageLink!
      prev: PageLink
      next: PageLink
      last: PageLink!
    }

    type PageMeta {
      totalCount: Int!
    }

    type ServiceHealth {
      status: String!
      uptimeSeconds: Float!
      timestamp: String!
    }

    type MutationResult {
      success: Boolean!
      message: String!
    }
  `,
  resolvers: {},
};
