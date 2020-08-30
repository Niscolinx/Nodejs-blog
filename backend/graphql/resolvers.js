const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

module.exports = {
    createUser: async function ({ userData }, req) {
        const error = []
        if (
            !validator.isEmail(userData.email) ||
            validator.isEmpty(userData.email)
        ) {
            error.push({ message: 'Invalid Email Field' })
        }
        if (
            !validator.isLength(userData.username, { min: 5 }) ||
            validator.isEmpty(userData.username)
        ) {
            error.push({
                message: 'Username must be at least 5 characters long',
            })
        }
        if (
            !validator.isLength(userData.password, { min: 5 }) ||
            validator.isEmpty(userData.password)
        ) {
            error.push({
                message: 'Password must be at least 5 characters long',
            })
        }

        if (error.length > 0) {
            const err = new Error('Invalid User Input')
            err.statusCode = 422
            err.data = error
            throw err
        }

        const existingUser = await User.findOne({ email: userData.email })

        if (existingUser) {
            const error = new Error('User already exists')
            throw error
        }
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 12)

            if (hashedPassword) {
                const newUser = new User({
                    username: userData.username,
                    email: userData.email,
                    password: hashedPassword,
                })

                const createdUser = await newUser.save()

                if (createdUser) {
                    return {
                        ...createdUser._doc,
                        _id: createdUser._id.toString(),
                    }
                }
            }
        } catch (err) {
            throw new Error(err)
        }
    },

    login: async function({email, password}){

        console.log('Reached the login')
        const userExits = await User.findOne({email})

        if(!userExits){
            const error = new Error('User does not exist')
            error.statusCode = 401
            throw error
        }

        const checkPassword = bcrypt.compare(password, userExits.password)

        if(!checkPassword){
            const error = new Error('Incorrect Password')
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            { email: userExits.email, userId: userExits._id.toString() },
            'supersecretkey',
            { expiresIn: '1hr' }
        )
        return {
            userId: userExits._id.toString(),
            token
        }
    }
}
