const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')

const {graphqlHTTP} = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')


const app = express()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(bodyParser.json())
app.use(multer({ storage, fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    )
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})


app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err){
        if(!err.originalError){
            return err
        }

        const message = err.message || 'An error occurred'
        const statusCode = err.originalError.statusCode || 500
        const data = err.originalError.data
        
        return {
            message, statusCode, data
        }
    }
}))

app.use((error, req, res, next) => {
    console.log(error, error.errorMessage)
    const status = error.statusCode || 500
    const message = error.message
    const errorMessage = error.errorMessage
    res.status(status).json({ message: message })
})

mongoose
    .connect(
        'mongodb+srv://munisco:fkNZcq4s9ZmcXho5@cluster0.zhgsa.mongodb.net/blog',
        { useUnifiedTopology: true, useNewUrlParser: true }
    )
    .then((result) => {
        console.log('Connected!!')
        app.listen(3030)
        
    })
    .catch((err) => console.log(err))
