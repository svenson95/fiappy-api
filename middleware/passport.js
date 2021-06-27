const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../models/user/User');

const cookieExtractor = req => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['fachentwickler_auth'];
    }
    return token;
};

// authenticated local strategy using username and password
passport.use(new JwtStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey: 'fachentwickler-95-secret'
}, (payload, done) => {
    User.findById({ _id: payload.sub }, (err, user) => {
        if (err)
            return done(err, false);
        if (user)
            return done(null, user);
        else
            return done(null, false);
    })
}));

// authorization
passport.use(new LocalStrategy((name, password, done) => {
    User.findOne({name}, (err, user) => {
        if (err)    // something went wrong with database
            return done(err);
        if (!user)  // if no user exist
            return done(null, false);
        user.comparePassword(password, done);   // check if password is correct

    })
}));
