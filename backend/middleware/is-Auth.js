const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    const authToken = req.get('Authorization')

    if(!authToken){
        const error = new Error('Unauthorized')
        error.statusCode = 403
        throw error
    }
   
    const gottenToken = authToken.split(' ')[1]

    let verifiedToken;

    try{
       verifiedToken =  jwt.verify(gottenToken, 'supersecretkey')
    }
    catch(err){
        err.statusCode = 500
        throw err
    }

    if(!verifiedToken){
        const error = new Error('Not authenticated')
        error.statusCode = 403
        throw err
    }

    req.userId = verifiedToken.userId
    next()
}