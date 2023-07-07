require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./db");
const PORT = 8099;
const router = require("./routes/routes");
const { auth } = require('express-openid-connect');
const routerr = require("./routes/routes")
const connectEnsureLogin = require("connect-ensure-login");
const passport = require("passport");
const session = require("express-session");
const utils = require("./utils/utils")
const passportSetup = require("./auth");
const axios = require("axios");
const routes = require("./routes/user-routes");
const ejs = require("ejs");

const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'URL Shortener(My links)',
    description: "This is Altschool capstone project",
    version: '1.0.0',
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/routes.js', './routes/user-routes.js', './controllers/controllers.js'],
};

const swaggerSpec = swaggerJSDoc(options);
const swaggerUi = require('swagger-ui-express');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(session({
    secret: 'your_session_secret',
    resave: false,
    saveUninitialized: true
  }));
app.set('view engine', 'ejs')
app.use(passport.initialize());
app.use(passport.session());
app.get("/", async (req, res) => {

   res.send("Welcome to myLinks!")

})

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use('/user',connectEnsureLogin.ensureLoggedIn());

app.use("/user", routes.userRouter);
app.use(utils.cache);
app.use("/",  router.router);


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

app.use((err, req, res, next) => {
  console.error(err); 
  res.status(err.status || 500);

  res.json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});
module.exports = {app}