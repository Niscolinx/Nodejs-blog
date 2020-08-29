const { buildSchema} = require('graphql')

module.exports = buildSchema(`

    type post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        UpdatedAt: String!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        posts: [post!]!
    }

    type input {
        username: String!
        email: String!
        password: String
    }

    schema {
        mutation: createUser(userData: String!): User!
    }
`)