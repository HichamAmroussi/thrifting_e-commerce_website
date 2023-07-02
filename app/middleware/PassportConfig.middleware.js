const localStrategy = require('passport-local').Strategy;

function initialize(passport, getUser) {
    const authenticateUser = (username, password, done) => {
        // Checking if the username is correct
        if(username !== process.env.ACCOUNT_USERNAME) {
            return done(null, false, { message: 'Username or password wrong' });
        }
        // Checking if the password is correct
        if(password === process.env.ACCOUNT_PASSWORD) {
            return done(null, process.env.ACCOUNT_USERNAME);
        } else {
            return done(null, false, { message: 'Username or password wrong' });
        }
    }

    const userId = Date.now().toString();

    passport.use(new localStrategy({ usernameField: 'username'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, userId));
    passport.deserializeUser((id, done) => { 
        done(null, userId);
    });
}

module.exports = initialize;