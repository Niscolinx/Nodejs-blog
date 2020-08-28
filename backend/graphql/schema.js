const { buildSchema} = require('graphql')


module.exports = buildSchema(`

    type TextData {
        name: String!
        age: Int!
    }

    type root{
        Hello: TextData!
    }

    schema {
        query: root
    }
`)