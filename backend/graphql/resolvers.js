const validator = require('validator')
const 

module.exports = {
    createUser({ userData }) {
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

        if(error.length > 0){
            const err = new Error('Invalid User Input')
            throw err
        }
        return {
            name: 'Collins',
            age: 25,
        }
    },
}
