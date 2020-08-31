const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    const authToken = req.get('Authorization')

    console.log('the auth token', authToken)

    if(!authToken){
       req.Auth = false
       next()
    }
   
    const gottenToken = authToken.split(' ')[1]

    let verifiedToken;

    try{
       verifiedToken =  jwt.verify(gottenToken, 'supersecretkey')
    }
    catch(err){
        req.Auth = false
        next()
    }

    if(!verifiedToken){
         req.Auth = false
         next()
    }
    console.log('the verified token is ', verifiedToken)
    
    req.userId = verifiedToken.userId
    req.Auth = true
    next()
}