const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require("./db")
const bcrypt = require("bcrypt");
const session = require("express-session");
require("dotenv").config();

// passport.use(
//     new GoogleStrategy({

//         callbackURL: "http://localhost:8099/google/redirect",
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET | null
//     }, (accessToken, refreshToken, profile, done) => {
//         // passport callback function
//         console.log('passport callback function fired:');
//         console.log(profile);

//     }
//     )
// );



const CustomStrategy = require('passport-custom').Strategy;
passport.use('custom',
  new CustomStrategy(async function(req, callback) {

    const body = req.body;
    const email = body.email;
    if(!email) { return callback(null, { redirect: "/input-email"})}
    const user = await db.db.findOne({where: {email: email}});
    if(user){
        return callback (null, { redirect : "/signup"}) 
    }
    else {
        const UserPass = user.password.toString();
        const inputUserPass = secure_pin.toString();
        if(!match) { return callback(null, false, { message : "Incorrect  Password!"})}
        req.login(user, function(err) {
            if (err) { return callback(err); }
            return callback(null, user);
          });
    }
  }
));
passport.serializeUser((user, done) => {
  console.log(user)
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

