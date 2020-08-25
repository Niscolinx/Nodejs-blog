const { validationResult } = require('express-validator/check')

const Post = require('../models/post')
const fileDelete = require('../utility/deleteFile')

exports.getPosts = (req, res, next) => {
    console.log('Getting query', req.query.page)
    Post.find()
        .then((posts) => {
            res.status(200).json({
                message: 'Fetched posts successfully.',
                posts,
            })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }
    if (!req.file) {
        const error = new Error('No image provided.')
        error.statusCode = 422
        throw error
    }
    const imageUrl = req.file.path
    const title = req.body.title
    const content = req.body.content
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: { name: 'Collins' },
    })
    post.save()
        .then((result) => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: result,
            })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}
exports.editPost = (req, res, next) => {
    const postId = req.params.postId
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.')
        error.statusCode = 422
        error.errorMessage = errors.array()[0].msg
        throw error
    }

    let oldImage
    Post.findById(postId)
        .then((foundPost) => {
            const { title, content } = req.body

            let imageUrl = foundPost.imageUrl
            if (req.file) {
                imageUrl = req.file.path
                oldImage = foundPost.imageUrl
            }

            ;(foundPost.title = title),
                (foundPost.content = content),
                (foundPost.imageUrl = imageUrl)

            return foundPost.save()
        })
        .then((result) => {

            if(oldImage){
                fileDelete.deleteFile(oldImage)
            }
            res.status(201).json({
                message: 'Post created successfully!',
                post: result,
            })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Could not find post.')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({ message: 'Post fetched.', post })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId

    Post.findById(postId)
        .then((product) => {
            let imageUrl
            if (product.imageUrl) {
                imageUrl = product.imageUrl
            }
            //Do some authorization
            Post.findOneAndDelete(postId).then((deletedProduct) => {
                if (imageUrl) {
                    fileDelete.deleteFile(imageUrl)
                }
                res.json({message: 'Deleted'})
            })
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}
