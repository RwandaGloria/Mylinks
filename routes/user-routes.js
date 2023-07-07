const express = require("express");
const userRouter = express.Router();
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
const path = require("path");

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });
  
userRouter.post("/user/custom-url", validator.validateCustomURLRoute, 
async(req, res) => {

  controllers.generateCustomURL(req, res)
});

    
userRouter.post("/user/generate-url", validator.validateURLRoute, utils.checkURL, async (req, res) => {
  controllers.generateRandomURL(req, res);
});

  userRouter.get("/user/allURLs", async (req, res) => {
    const userId = req.user.id;
    const userURLs = await db.db.URLs.findAll({
        where: {
            user_id: userId
        }
    });
    return res.status(200).json(userId);
  })

  module.exports = {userRouter}