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

router.get("/signup",  validator.validateSignUp, async (req, res) => {
  res.render("signup");
});

router.get("/login/",  async (req, res) => {
  res.render("login");
});
router.get("/home", async (req, res) => {
  res.send("Hello!");
});

router.post("/login", validator.validateLogin, passport.authenticate('custom', { 
  successRedirect: '/home', 
  failureRedirect: '/signup', 
}));

router.post("/input-email", validator.validateEmailRoute, async (req, res) => 
{

  controllers.inputEmail(req, res)

})


router.get("/:shortUrl", async (req, res) => {

  const base = "http://localhost:8099/"
  const shortUrl = req.params.shortUrl;

  const checkURLInDatabase = await db.db.URLs.findOne({where: {
    shortURL: `${base}${shortUrl}`
  }});

  if(!checkURLInDatabase) {
    return res.status(404).json({message: "This URL does not exist!"});
  }

  let imageData;
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const ipData = await axios.get(`http://ip-api.com/json/102.89.45.142`) || "unknown"
    console.log(ipData.data);

  const newUpdate =  await db.db.URLs.update(
    { linkClickCount: checkURLInDatabase.linkClickCount + 1 },
    { where: { shortURL: `${base}${shortUrl}` } }
  );

  console.log(newUpdate)

  await db.db.clickData.create({

    link_id: "8b3f2830-4ce7-4344-93e6-b37194bd2fc8",
    Country: `${ipData.data.country}` || null,
    state: `${ipData.data.regionName}` || null
  
  })

  return res.status(302).redirect(checkURLInDatabase.dataValues.longURL)
})




router.post("/signup", validator.validateSignUp, async (req, res) => 
{

    const body = req.body;
    controllers.signUp(req, res)
    // controllers.checkURL(body.url);

})

module.exports = router