const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.users_signup_user = (req, res, next) => {

    User.find({email:req.body.email})
        .exec()
        .then(user => {
            if(user.length > 0) return res.status(409).json({
                message: 'Mail exists'
            });
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err)
                        res.status(500).json({
                            error: err,
                        });
                    else{
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'user created',
            
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err,
                                });
                            });
                    }
                });
            }
        })
        .catch();
};

exports.users_login_user = (req, res, next) => {
    User.findOne({email: req.body.email}).exec()
        .then(user => {
            if (!user) return res.status(401).json({
                message: 'Auth failed!'
            });
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) return res.status(401).json({
                    message: 'Auth failed!'
                });
                if (result) {
                    const token = jwt.sign({
                            email: user.email,
                            userId: user._id,
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token, // response a token for client(client must save the token in a storage to provide it for authentication)
                    });
                }
                res.status(401).json({
                    message: 'Auth failed!'
                });
            })
        })
        .catch();
};

exports.users_delete_user = (req, res, next) => {
    User.remove({_id: req.params.userId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted!',
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err,
        });
    });
};