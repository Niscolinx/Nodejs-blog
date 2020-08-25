const { validationResult }  = require('express-validator/check')

const postSignup = (req, res, next) => {
    console.log('gotten to the signup')

    const { email, password, username } = req.body

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
          const error = new Error(
              'Validation failed, entered data is incorrect.'
          )
          error.statusCode = 422
          error.errorMessage = errors.array()[0].msg
          throw error
      }

}