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


let newURL;


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
  });
  
userRouter.post("/user/custom-url", validator.validateCustomURLRoute, async(req, res) => {

    try
    {

      const body = req.body;
      const shortURL = body.shortURL
      const longURL = req.body.longURL;
      const base = "http://localhost:8099/"
      const URLAppend = body.shortURL;
      const URLToAdd = `${base}${URLAppend}`;
      const newURL = {
        longURL: longURL,
        shortURL: `${base}${shortURL}`
      }     
       const qrCodeFilePath = 'C:/Users/apexs/OneDrive/Documents/URL Shortening/';
    
    const checkIfURLExists = await db.db.URLs.findOne({where: {shortURL: URLToAdd}});
    
    console.log(checkIfURLExists)
    if(checkIfURLExists)
    {
      return res.status(400).json({message: "That URL has been assigned to someone else. Please try again!"});
    }
    
    else {

        const newURL = {
            longURL: longURL,
            shortURL: `${base}${body.shortURL}`
          }
    
        const qrCodeFilePath = 'C:/Users/apexs/OneDrive/Documents/URL Shortening/';
      
        QRCode.toFile(qrCodeFilePath, `${body.shortURL}`, { type: 'jpeg' }, async function (err, filePath) {
          if (err) {
            console.error(err);
          } else {
    
              const result = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload(qrCodeFilePath, { public_id: `${shortURL}` }, function (error, result) {
                  if (error) reject(error);
                  else resolve(result);
                  console.log(result);
                  fs.unlinkSync(qrCodeFilePath);
                 })
              });
              redisClient.set(URLToAdd, result.secure_url , 'EX', 3600, async (err) => {
                if (err) {
                 console.error('Error saving image to Redis:', err);
                }
                else {
                 res.setHeader('Content-Type', 'image/jpeg')
                 res.send(result.secure_url);
                }
              });
              Object.assign(newURL, {QRCodeImage: result.secure_url});
                 const createNewURL =  await db.db.URLs.create(newURL)
                 return res.status(201).json(createNewURL);   
          }
          })
        }}
    
    
    catch(err){
    
      console.log(err)
      return res.status(500).json(err);
    }
    })

    
userRouter.post("/generate-url", validator.validateURLRoute, utils.checkURL, async (req, res) => {

    try {
      const body = req.body;
      const longURL = body.url;
      const base = "http://localhost:8099/"
      const shortURL = await utils.generateShortURL();
      const imageId = `${base}${shortURL}`;
  
      const newURL = {
        longURL: longURL,
        shortURL: `${base}${shortURL}`
      }

    const qrCodeFilePath = 'C:/Users/apexs/OneDrive/Documents/URL Shortening/';
  
    QRCode.toFile(qrCodeFilePath, `${shortURL}`, { type: 'jpeg' }, async function (err, filePath) {
      if (err) {
        console.error(err);
      } else {

          const result = await new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(qrCodeFilePath, { public_id: `${shortURL}` }, function (error, result) {
              if (error) reject(error);
              else resolve(result);
              console.log(result);
              fs.unlinkSync(qrCodeFilePath);
             })
          });
          redisClient.set(imageId, result.secure_url , 'EX', 3600, async (err) => {
            if (err) {
             console.error('Error saving image to Redis:', err);
            }
            else {
             res.setHeader('Content-Type', 'image/jpeg')
             res.send(result.secure_url);
            }
          });
          Object.assign(newURL, {QRCodeImage: result.secure_url});
             const createNewURL =  await db.db.URLs.create(newURL)
             return res.status(201).json(createNewURL);   
      }
      })
    }
    catch(err){
        console.error(err);
      return res.status(400).send(err)
    }
  
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