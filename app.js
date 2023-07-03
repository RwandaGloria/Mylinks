require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./db");
const PORT = 8099;
const router = require("./routes/routes");
const { auth } = require('express-openid-connect');
const connectEnsureLogin = require("connect-ensure-login");
const passport = require("passport");
const session = require("express-session");
const utils = require("./utils/utils")
const passportSetup = require("./auth");
const axios = require("axios");
const routes = require("./routes/user-routes");
const ejs = require("ejs");

// Before defining your routes

app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
  }));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index');
});



app.use(passport.initialize());
app.use(passport.session());


router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.send('you reached the redirect URI');
});


app.get("/url", async(req, res) => {
    
    const url = await utils.generateTwoDigitAlphanumeric();
    res.send(url)
        
})

app.get("/", async (req, res) => {

    const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const base = "http://localhost:8099/"
    console.log(ipAddress);

})

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use(routes.userRouter);
app.use(utils.cache);
app.use(router);


app.get("/data", (req, res) => {
    let data = 0;
    for (let i = 1; i < 100000000; i++) {
      data += 1;
    }
    res.json(data);
  });

app.listen(PORT, () => {

    console.log("Server started successfully at " + PORT);
    db.connect();

    utils.client.connect().then(()=> {
        console.log('redis is connected')
      })

});
module.exports = {app}