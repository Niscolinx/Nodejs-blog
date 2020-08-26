const express = require('express')
const { body } = require('express-validator/check')

const userController = require('../controllers/user')
const User = require('../models/user')

const router = express.Router()

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Invalid email')
            .custom((value, { req }) => {
               return User.findOne({ email: value }).then((userDoc) => {
                    if (userDoc) {
                        return Promise.reject('User already exits')
                    }
                })
            }),
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
            .withMessage('Invalid email'),
        body('password').trim().isLength({ min: 5 }),
    ],
    userController.postLogin
)

module.exports = router
