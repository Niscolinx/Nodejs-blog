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
            res.status(201).json({ message: 'Successful signup' })
        })
        .catch((err) => {
            next(err)
        })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    User.find({ email })
        .then((user) => {
            if (!user) {
                const error = new Error('user validation failed')
                error.statusCode = 422
                throw error
            }

            bcrypt.compare(password, user.password).then((isEqual) => {
                if (isEqual) {
                    res.status(201).json({ message: 'Successful login' })
                } else {
                    res.status(403).json({ message: 'Password is incorrent' })
                    throw new Error('Incorrect password')
                }
            })
        })

        .catch((err) => {
            next(err)
        })
}
