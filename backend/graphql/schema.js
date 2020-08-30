const { buildSchema } = require('graphql')

module.exports = buildSchema(`

    type Post {
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
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input UserInputData {
        username: String!
        email: String!
        password: String
    }

    type RootMutation {
        createUser(userData: UserInputData): User!
    }

    type rootQuery{
        login(email: String, password: String): AuthData!
    }

    schema {
        query: rootQuery
        mutation: RootMutation
    }
`)
