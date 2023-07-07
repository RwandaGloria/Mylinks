const express = require("express");
const router = express.Router();
const utils = require("../utils/utils");
const passport = require("passport");
const session = require("express-session");
const controllers = require("../controllers/controllers");
const db = require("../db");
const axios = require("axios");
const validator = require("../validation/validator");
const QRCode = require('qrcode');
const fs = require('fs');
const redisClient = require("../utils/utils").client;
const cloudinary = require("cloudinary");

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET

});

router.get("/home/hi", async (req, res) => {
  res.send("Hello!");
  
});

router.post("/login", passport.authenticate('local-login'), async (req, res) => {

  res.status(302).redirect("/home");
});

router.post("/input-email", validator.validateEmailRoute, async (req, res) => 
{
  controllers.inputEmail(req, res);
})


router.post("/reset/password", async (req, res) => {

  controllers.resetPassword(req, res);
});
router.get("/:shortUrl", async (req, res) => {
  controllers.getURL(req, res);
})
router.post("/signup", validator.validateSignUp, async (req, res) => 
{
    const body = req.body;
    controllers.signUp(req, res);
    // controllers.checkURL(body.url);
})
module.exports = {router}