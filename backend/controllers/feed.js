const { validationResult } = require('express-validator/check')

const Post = require('../models/post')
const User = require('../models/user')
const fileDelete = require('../utility/deleteFile')
const post = require('../models/post')

const MAX_PRODUCT_TO_DISPLAY = 1

exports.getPosts = (req, res, next) => {
    const page = req.query.page || 1
    let totalItems

    Post.find()
        .countDocuments()
        .then((totalProducts) => {
            totalItems = totalProducts
            return Post.find()
                .skip((page - 1) * MAX_PRODUCT_TO_DISPLAY)
                .limit(MAX_PRODUCT_TO_DISPLAY)
        })
        .then((posts) => {
            console.log('the get posts', posts)
            res.status(200).json({
                message: 'Fetched posts successfully.',
                posts,
                totalItems,
                lastPage: MAX_PRODUCT_TO_DISPLAY,
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

    let fetchedPost
    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId,
    })
    return post
        .save()
        .then((post) => {
            fetchedPost = post
            return User.findById(req.userId)
        })
        .then((user) => {
            user.posts.push(fetchedPost._id.toString())

            return user.save()
        })
        .then((userPost) => {
            res.status(201).json({
                message: 'Post created successfully!',
                posts: fetchedPost,
                creator: { _id: userPost._id, username: userPost.username },
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
            console.log('the product it update', foundPost)

            if (foundPost.creator._id.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }

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
            if (oldImage) {
                fileDelete.deleteFile(oldImage)
            }
            res.status(201).json({
                message: 'Post Edited successfully!',
                posts: result,
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
        .then((foundPost) => {
            if (foundPost.creator._id.toString() !== req.userId) {
                const error = new Error('Not authorized')
                error.statusCode = 403
                throw error
            }
            let imageUrl
            if (foundPost.imageUrl) {
                imageUrl = foundPost.imageUrl
            }
            if (imageUrl) {
                console.log('the image url', imageUrl)
                fileDelete.deleteFile(imageUrl)
            }
            //Do some authorization
            return Post.findOneAndDelete(postId)
        })
        .then((deletedpost) => {
            console.log('deleted post', deletedpost)

            User.findById(deletedpost.creator).then((user) => {
                console.log('the user', user)
                console.log('the user posts', user.posts)

                user[0].posts.filter((p) => {
                    return p.toString() !== deletedpost._id.toString()
                })
               return user.save()
                    .then((res) => {
                        console.log('the updated user', res)
                        res.json({ message: 'Deleted' })
                    })
                    .catch((err) => {
                        if (!err.statusCode) {
                            err.statusCode = 500
                        }
                        next(err)
                    })
            })
        })

        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}
