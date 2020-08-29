const validator = require('validator')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

module.exports = {
    createUser: async function ({ userData }, req) {
        const error = []
        if (!validator.isEmail(userData.email)) {
            error.push({ message: 'Invalid Email Field' })
        }
        if (!validator.isLength(userData.username, { min: 5 })) {
            error.push({
                message: 'Username must be at least 5 characters long',
            })
        }
        if (!validator.isLength(userData.password, { min: 5 })) {
            error.push({
                message: 'Password must be at least 5 characters long',
            })
        }

        if (error.length > 0) {
            const err = new Error('Invalid User Input')
            throw err
        }

        const user = await User.findOne({ email: userData.email })

        if (user) {
            const error = new Error('User already exists')
            throw error
        }
        try{
            const hashedPassword = await bcrypt(userData.password, 12)

            if(hashedPassword){
                
                const newUser = new User({
                    username = userData.username,
                    email = userData.email,
                    password = hashedPassword
                })

                const userSignupUp = await newUser.save()

                if(userSignupUp){
                    return 'Successful sign up'
                }

            }
        }
        catch(err){
            throw new Error(err)
        }
    },
}
