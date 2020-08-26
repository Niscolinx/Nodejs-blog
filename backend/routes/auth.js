const express = require('express')
const { body } = require('express-validator/check')

const userController = require('../controllers/user')
const User = require('../models/user')

const router = express.Router()

router.post(
    '/signup',
    [
        body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
        body('password').trim().isLength({ min: 5 }),
        body('username').trim().isLength({ min: 5 }),
    ],
    userController.postSignup
)
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid email')
            .custom((value, { req }) => {

                User.find({email: value}).then(res => {
                    console.log('from the validation', res)
                })
                .catch(err => {
                    console.log('from validation error', err)
                    return Promise.reject('User does not exist')
                })
            }),
        body('password').trim().isLength({ min: 5 }),
    ],
    userController.postLogin
)

module.exports = router
