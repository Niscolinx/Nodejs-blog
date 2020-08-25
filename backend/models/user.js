const mongoose = require('mongoose')

const Schema = mongoose.Schema()

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    post: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Post',
        },
    ],
})

module.exports = mongoose.Model('users', userSchema)
