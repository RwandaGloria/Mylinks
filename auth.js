const passport = require('passport');
const db = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");
require("dotenv").config();

const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use("google", new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/callback"
  },

  
  function(accessToken, refreshToken, profile, done) {
    try {
      
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      console.log(profile);
      return done(null, profile);
    }
    catch(err) {
      throw new Error (err)
    }
}));

// Local Signup Strategy
passport.use("local-signup", new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await db.db.findOne({ where: { email: email } });
    if (user) {
      // User with the provided email already exists
      return done(null, false, { message: "User with this email already exists." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user in the database
    const newUser = await db.db.create({ email: email, password: hashedPassword });
    return done(null, newUser);
  } catch (error) {
    return done(error);
  }
}));

// Local Login Strategy
passport.use("local-login", new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await db.db.users.findOne({ where: { email: email } });
    if (!user) {
      // User with the provided email does not exist
      return done(null, false, { message: "User with this email does not exist." });
    }
    // Compare the password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // Incorrect password
      return done(null, false, { message: "Incorrect password." });
    }
    // Password is correct, authenticate the user
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
