import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    hello: String
    health: HealthStatus
    getUsers: [User!]!
    getUser(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type HealthStatus {
    status: String!
    timestamp: String!
    services: ServicesStatus
  }

  type ServicesStatus {
    pythonAPI: String!
    database: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String
    email: String
  }
`;


