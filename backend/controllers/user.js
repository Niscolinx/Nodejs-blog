const { validationResult } = require('express-validator/check')

const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.postSignup = (req, res, next) => {

    const { email, password, username } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email,
                username,
                password: hashedPassword,
                status: 'New user',
            })

            return user.save()
        })
        .then((result) => {
            console.log(result)
            res.json({ message: 'Successful signup' })
        })
        .catch((err) => {
            next(err)
        })
}

exports.postLogin = (req, res, next) => {

    const { email, password, username } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                email,
                username,
                password: hashedPassword,
                status: 'New user',
            })

            return user.save()
        })
        .then((result) => {
            console.log(result)
            res.json({ message: 'Successful signup' })
        })
        .catch((err) => {
            next(err)
        })
}
