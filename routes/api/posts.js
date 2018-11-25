const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport')

// Load Validator
const validatePostInput = require('../../validation/post')

// Post Model
const Post = require('../../models/Post')
// Profile Model
const Profile = require('../../models/Profile')

// @routes  GET api/posts/test
// @desc    Test Route
// @access  public
router.get('/test', (req, res) => {
    res.json({ msg: "Posts Works!" })
});

// @routes  GET api/posts
// @desc    GET Post
// @access  public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ errors: 'No Posts Found' }))
})

// @routes  GET api/posts/:id
// @desc    GET Post by ID
// @access  public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ errors: 'Can\'t find Post with that ID' }))
})

// @routes  POST api/posts
// @desc    Create Post
// @access  private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check the validation
    if (!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});


// @routes  DELETE api/posts/:id
// @desc    DELETE Post
// @access  private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    // Check for Post Owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorize: 'User not Authorize' });
                    }

                    // Delete
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ error: 'Post not Found' }))
        })
});

// @routes  POST api/posts/like/:id
// @desc    Like post
// @access  private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: 'User Already Liked this post' });
                    }

                    // Add the user id to the likes array
                    post.likes.unshift({ user: req.user.id });

                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ error: 'Post not Found' }))
        })
});

// @routes  POST api/posts/unlike/:id
// @desc    unLike post
// @access  private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notliked: 'You have not liked this post yet' });
                    }

                    // Get the remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    //Splice it out of the array
                    post.likes.splice(removeIndex, 1);

                    //Save
                    post.save().then(post => res.json(post))
                })
                .catch(err => res.status(404).json({ error: 'Post not Found' }))
        })
});

// @routes  POST api/posts/comment/:id
// @desc    comment post
// @access  private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check the validation
    if (!isValid) {
        //Return any errors with 400 status
        return res.status(400).json(errors);
    }


    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            // Add to comments array
            post.comments.unshift(newComment);

            // Save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
})

// @routes  DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id)
        .then(post => {
            //CHeck if the comment exists
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentnotexist: 'Comment not Exists' })
            }

            // Get Remove Index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id)

            // Splice it out of array
            post.comments.splice(removeIndex, 1);

            // Save
            post.save().then(post => res.json(post))
        })
        .catch(err => res.status(404).json({ postnotfound: 'Post not found' }))
})
module.exports = router
