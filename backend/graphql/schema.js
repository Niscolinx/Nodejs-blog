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

    type createUser{
        login(name: String, password: String): AuthData!
    }

    schema {
        query: createUser
        mutation: RootMutation
    }
`)
