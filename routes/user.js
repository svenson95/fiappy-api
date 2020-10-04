const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const passportConfig = require('../middleware/passport');
const JWT = require('jsonwebtoken');
const User = require('../models/user/User');
const Progress = require('../models/user/Progress');
const Subject = require('../models/subject/Subject');

const signToken = userId => {
    return JWT.sign({
        iss: 'devedu-95-secret',
        sub: userId
    }, 'devedu-95-secret', { expiresIn: '30d' })
};

userRouter.post('/register', (req, res) => {
   const { password, role, email } = req.body;
   const name = req.body.name.toLowerCase();
   User.findOne({ name }, (error, nameData) => {
       if (error) {
           res.status(500).json({message: {msgBody: "Error has occured", error: error }});
       } else if (nameData) {
           res.status(409).json({ message: "Username is already taken", error: error });
       } else {
           User.findOne({ email }, (error, emailData) => {
               if (error) {
                   res.status(500).json({message: {msgBody: "Error has occured", error: error }});
               } else if (emailData) {
                   res.status(409).json({ message: "E-Mail is already taken", error: error });
               } else {
                   const newUser = new User({ name, password, role, email });
                   newUser.save((err, newUser) => {
                       if (err) {
                           res.status(500).json({message: "Registration process failed", error: err });
                       } else {
                           res.status(201).json({message: "Account successfully created", user: newUser });
                       }
                   })
               }
           });
       }
   });
});

userRouter.patch('/edit-user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const name = req.body.name;
    User.findOne({ name }, async (err, user) => {
        if (user) {

            if (req.body.name && req.body.email && req.body.password) {
                user.name = req.body.name;
                user.password = req.body.password;
                user.email = req.body.email;
            }

            if (req.body.newName) {
                user.name = req.body.newName;
            }

            if (req.body.theme) {
                user.theme = req.body.theme;
            }

            if (req.body.progress) {
                user.progress = req.body.progress;
            }

            const newName = req.body.newName;
            const newEmail = req.body.email;

            User.findOne({ "name": newName }, async (err2, user2) => {
                if (user2) {
                    return res.status(409).json({ message: "Username is already taken" });
                } else if (err2) {
                    return res.status(500).json({ message: "Error has occured while changing user (4)", error: err2 });
                } else {

                    User.findOne({ "email": newEmail}, async (err3, user3) => {
                        if (user3) {
                            return res.status(409).json({ message: "E-Mail is already taken" });
                        } else if (err3) {
                            return res.status(500).json({ message: "Error has occured while changing user (2)", error: err3 });
                        } else {
                            user.save(err4 => {
                                if (err4) {
                                    res.status(500).json({ message: "Error has occured while changing user (5)", error: err4 });
                                } else {
                                    res.status(201).json({ message: "User successfully changed", user: user });
                                }
                            });
                        }
                    });
                }
            });

        } else if (err) {
            res.status(500).json({ message: "User not found", error: err });
        }
    });
});

userRouter.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    if (req.isAuthenticated()) {
        const token = signToken(req.user._id);
        res.cookie('devedu_token', token, {
            maxAge: 1000 * 3600 * 24 * 30, // would expire after 30 days
            httpOnly: true, // The cookie only accessible by the web server
        });
        res.status(200).json({ isAuthenticated: true, user: req.user, token: token });
    } else {
        res.status(409).json({message: "Wrong password", response: res });
    }
});

userRouter.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    // req.logout();
    res.clearCookie('devedu_token');
    res.json({ message: 'Successfully logged out', success: true });
});

userRouter.get('/progress', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await User.findById({ _id : req.user._id }).populate('progress').exec((err, document) => {
        if (err) {
            res.status(500).json({ message : {msgBody: 'Get progress data failed', msgError : true }})
        } else {
            res.status(200).json({ user: document });
        }
    })
});

userRouter.post('/add-progress', passport.authenticate('jwt', { session: false }), (req, res) => {
    const newProgress = new Progress(req.body);
    newProgress.save(error => {
        if (error) {
            res.status(500).json({ message: 'Add progress data failed - save new post', error: error })
        } else {
            req.user.progress.push(req.body.postId);
            req.user.save(error2 => {
                if (error2) {
                    res.status(500).json({ message: 'Add progress data failed - save edited user (progress array)', error: error2 })
                } else {
                    res.status(200).json({ message: 'Successfully added progress', progress: newProgress })
                }
            });
        }
    });
});

userRouter.get('/admin', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.role === 'admin') {
        res.status(200).json({ message: { body: 'Admin logged in', error: false }});
    } else {
        res.status(403).json({ message: { body: 'You are not an admin', error: true }})
    }
});

userRouter.get('/authenticated', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            isAuthenticated: true,
            user: req.user
        });
    } else {
        res.status(401).json({ message: 'You are not logged in', res: res, req: req })
    }
});

module.exports = userRouter;
