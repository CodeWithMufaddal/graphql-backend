export const typeDefs = /* GraphQL */ `
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

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    username: String!
    email: String!
    phone: String
    website: String
    posts: [Post!]!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    user: User!
    comments: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    name: String!
    email: String!
    body: String!
    post: Post!
    createdAt: String!
    updatedAt: String!
  }

  type UserPage {
    meta: PageMeta!
    links: PageLinks!
    data: [User!]!
  }

  type PostPage {
    meta: PageMeta!
    links: PageLinks!
    data: [Post!]!
  }

  input RegisterInput {
    name: String!
    username: String!
    email: String!
    password: String!
    phone: String
    website: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateUserInput {
    name: String!
    username: String!
    email: String!
    phone: String
    website: String
    password: String
  }

  input UpdateUserInput {
    name: String
    username: String
    email: String
    phone: String
    website: String
    password: String
  }

  input CreatePostInput {
    title: String!
    body: String!
    userId: ID
  }

  input UpdatePostInput {
    title: String
    body: String
    userId: ID
  }

  type Query {
    health: ServiceHealth!
    me: User
    users(options: PageQueryOptions): UserPage!
    user(id: ID!): User
    posts(options: PageQueryOptions): PostPage!
    post(id: ID!): Post
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): MutationResult!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): MutationResult!
  }
`;
