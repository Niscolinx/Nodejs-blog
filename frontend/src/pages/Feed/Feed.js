import React, { Component, Fragment } from 'react'

import Post from '../../components/Feed/Post/Post'
import Button from '../../components/Button/Button'
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit'
import Input from '../../components/Form/Input/Input'
import Paginator from '../../components/Paginator/Paginator'
import Loader from '../../components/Loader/Loader'
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler'
import './Feed.css'

class Feed extends Component {
    state = {
        isEditing: false,
        posts: [],
        totalPosts: 0,
        editPost: null,
        status: '',
        user: '',
        postPage: 1,
        postsLoading: true,
        editLoading: false,
    }

    componentDidMount() {
        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token,
            },
        })
            .then((res) => {
                return res.json()
            })
            .then((resData) => {
                if (resData.status !== 200) {
                    throw new Error('Failed to fetch user status.')
                }
                this.setState({ status: resData.status })
            })
            .catch(this.catchError)

        this.loadPosts()
    }

    loadPosts = (direction) => {
        if (direction) {
            this.setState({ postsLoading: true, posts: [] })
        }
        let page = this.state.postPage
        if (direction === 'next') {
            page++
            this.setState({ postPage: page })
        }
        if (direction === 'previous') {
            page--
            this.setState({ postPage: page })
        }
        const graphqlQuery = {
            query: `{
                getPosts(page: ${page}) {
                      Post {
                        _id
                        title
                        content
                        imageUrl
                        createdAt
                        creator {
                            username
                            }   
                        }
                    totalPosts
                    lastPage
                  }
                }`,
        }
        fetch('http://localhost:3030/graphql', {
            method: 'POST',
            body: JSON.stringify(graphqlQuery),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token,
            },
        })
            .then((res) => {
                return res.json()
            })
            .then((resData) => {
                const fetchedPosts = resData.data.getPosts
                console.log('the res data', fetchedPosts)
                if (resData.errors) {
                    throw new Error('Failed to Load posts.')
                }
                this.setState({
                    posts: fetchedPosts.Post.map((p) => {
                        return {
                            ...p,
                            imagePath: p.imageUrl,
                        }
                    }),
                    totalPosts: fetchedPosts.totalPosts,
                    lastPage: fetchedPosts.lastPage,
                    postsLoading: false,
                })
            })
            .catch(this.catchError)
    }

    statusUpdateHandler = (event) => {
        event.preventDefault()
        fetch('http://localhost:3030/feed/userStatus', {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + this.props.token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: this.state.status,
            }),
        })
            .then((res) => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error("Can't update status!")
                }
                return res.json()
            })
            .then((resData) => {
                this.setState({
                    status: resData.updatedUser.status,
                    user: resData.updatedUser.email,
                })
            })
            .catch(this.catchError)
    }

    newPostHandler = () => {
        this.setState({ isEditing: true })
    }

    startEditPostHandler = (postId) => {
        this.setState((prevState) => {
            const loadedPost = {
                ...prevState.posts.find((p) => p._id === postId),
            }

            return {
                isEditing: true,
                editPost: loadedPost,
                postId,
            }
        })
    }

    cancelEditHandler = () => {
        this.setState({ isEditing: false, editPost: null })
    }

    finishEditHandler = (postData) => {
        const formData = new FormData()

        formData.append('image', postData.image)
        if (this.state.editPost) {
            formData.append('oldImage', this.state.editPost.imagePath)
        }

        fetch('http://localhost:3030/post-image', {
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + this.props.token,
            },
            body: formData,
        })
            .then((res) => {
                return res.json()
            })
            .then((result) => {
                const imageUrl = result.filePath

                let graphqlQuery = {
                    query: `
                    mutation { createPost(postData: {
                            title: "${postData.title}",
                            content: "${postData.content}",
                            imageUrl: "${imageUrl}"
                        }){
                            _id
                            title
                            content
                            imageUrl
                            creator {
                                username
                            }
                            createdAt
                        }
                    }
                `,
                }

                if (this.state.editPost) {
                    graphqlQuery = {
                        query: `
                        mutation { updatePost( id: "${this.state.editPost._id}", postData: {
                                title: "${postData.title}",
                                content: "${postData.content}",
                                imageUrl: "${imageUrl}"
                            }){
                                _id
                                title
                                content
                                imageUrl
                                creator {
                                    username
                                }
                                createdAt
                            }
                        }
                    `,
                    }
                }

                this.setState({
                    editLoading: true,
                    imagePath: result.filePath,
                })

                return fetch('http://localhost:3030/graphql', {
                    method: 'POST',
                    body: JSON.stringify(graphqlQuery),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + this.props.token,
                    },
                })
            })

            .then((res) => {
                return res.json()
            })
            .then((resData) => {
                let queryToPost = 'createPost'

                if (this.state.editPost) {
                    queryToPost = 'updatePost'
                }

                const postQuery = resData.data[queryToPost]

                if (resData.errors && resData.errors[0].status === 422) {
                    throw new Error(
                        "Validation failed. Make sure the email address isn't used yet!"
                    )
                }

                if (resData.errors) {
                    throw new Error('Creating or editing a post failed!')
                }

                const post = {
                    _id: postQuery._id,
                    title: postQuery.title,
                    content: postQuery.content,
                    creator: postQuery.creator.username,
                    createdAt: postQuery.createdAt,
                    imagePath: postQuery.imageUrl,
                }
                this.setState((prevState) => {
                    const updatedPosts = [...prevState.posts]

                    if (prevState.editPost) {
                        const findIndex = prevState.posts.findIndex((p) => {
                            return p._id === prevState.editPost._id
                        })

                        updatedPosts[findIndex] = post
                    } else {
                        updatedPosts.pop()
                        updatedPosts.unshift(post)
                    }
                    return {
                        posts: updatedPosts,
                        isEditing: false,
                        editPost: null,
                        editLoading: false,
                    }
                })
            })
            .catch((err) => {
                console.log(err)
                this.setState({
                    isEditing: false,
                    editPost: null,
                    editLoading: false,
                    error: err,
                })
            })
    }

    statusInputChangeHandler = (input, value) => {
        this.setState({ status: value })
    }

    deletePostHandler = (postId) => {
        this.setState({ postsLoading: true })


        const graphqlQuery = {
            query: `
                mutation {
                    deletePost(id: "${postId}")
                }
            `,
        }
        fetch('http://localhost:3030/graphql', {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + this.props.token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(graphqlQuery),
        })
            .then((res) => {
                return res.json()
            })
            .then((resData) => {
                console.log('the deleted post', resData)
                if (resData.status !== 200) {
                    throw new Error('Deleting a post failed!')
                }
                this.loadPosts()
            })
            .catch((err) => {
                console.log(err)
                this.setState({ postsLoading: false })
            })
    }

    errorHandler = () => {
        this.setState({ error: null })
    }

    catchError = (error) => {
        this.setState({ error: error })
    }

    render() {
        return (
            <Fragment>
                <ErrorHandler
                    error={this.state.error}
                    onHandle={this.errorHandler}
                />
                <FeedEdit
                    editing={this.state.isEditing}
                    selectedPost={this.state.editPost}
                    loading={this.state.editLoading}
                    onCancelEdit={this.cancelEditHandler}
                    onFinishEdit={this.finishEditHandler}
                />
                <section className='feed__status'>
                    <form onSubmit={this.statusUpdateHandler}>
                        <Input
                            type='text'
                            placeholder='Your status'
                            control='input'
                            onChange={this.statusInputChangeHandler}
                            value={this.state.status}
                        />
                        <Button mode='flat' type='submit'>
                            Update
                        </Button>
                    </form>
                </section>
                <section className='feed__control'>
                    <Button
                        mode='raised'
                        design='accent'
                        onClick={this.newPostHandler}
                    >
                        New Post
                    </Button>
                </section>
                <section className='feed'>
                    {this.state.postsLoading && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Loader />
                        </div>
                    )}
                    {this.state.posts.length <= 0 &&
                    !this.state.postsLoading ? (
                        <p style={{ textAlign: 'center' }}>No posts found.</p>
                    ) : null}
                    {!this.state.postsLoading && (
                        <Paginator
                            onPrevious={this.loadPosts.bind(this, 'previous')}
                            onNext={this.loadPosts.bind(this, 'next')}
                            lastPage={Math.ceil(
                                this.state.totalPosts / this.state.lastPage
                            )}
                            currentPage={this.state.postPage}
                        >
                            {this.state.posts.map((post) => {
                                return (
                                    <Post
                                        key={post._id}
                                        id={post._id}
                                        author={post.creator.username}
                                        date={new Date(
                                            post.createdAt
                                        ).toLocaleDateString('en-US')}
                                        title={post.title}
                                        // image={
                                        //     'http://localhost:3030/' +
                                        //     post.imageUrl
                                        // }
                                        content={post.content}
                                        onStartEdit={this.startEditPostHandler.bind(
                                            this,
                                            post._id
                                        )}
                                        onDelete={this.deletePostHandler.bind(
                                            this,
                                            post._id
                                        )}
                                    />
                                )
                            })}
                        </Paginator>
                    )}
                </section>
            </Fragment>
        )
    }
}

export default Feed
