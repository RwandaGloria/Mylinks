const db = require("../db");
const session = require("express-session");
const bcrypt = require("bcrypt");
const utils = require("../utils/utils");
const path = require("path");
const passport = require("passport");
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

  const qrpath = path.join(__dirname, "QR");



  async function getURLData(req, res){

    const urlId = req.params.id;
    const body = req.body;

    const findUrl = await db.db.URLs.findOne({where: {

        id: urlId
    }});

    if(!findUrl){

        return res.status(400).send("URL not found!");
    }
    return res.status(200).send(findUrl);
  }


async function generateRandomURL(req, res){

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
      
      QRCode.toFile(qrpath, `${shortURL}`, { type: 'jpeg' }, async function (err, filePath) {
        if (err) {
          console.error(err);
        } else {
  
            const result = await new Promise((resolve, reject) => {
              cloudinary.v2.uploader.upload(qrpath, { public_id: `${shortURL}` }, function (error, result) {
                if (error) reject(error);
                else resolve(result);
                console.log(result);
                fs.unlinkSync(qrpath);
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
    
}

async function generateCustomURL(req, res){
    try
    {
      console.log("Hello Gloria!");
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
        QRCode.toFile(qrpath, `${body.shortURL}`, { type: 'jpeg' }, async function (err, filePath) {
          if (err) {
            console.error(err);
          } else {
    
              const result = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload(qrpath, { public_id: `${shortURL}` }, function (error, result) {
                  if (error) reject(error);
                  else resolve(result);
                  console.log(result);
                  fs.unlinkSync(qrpath);
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
}

async function inputEmail(req, res) {

    try{

        const email = req.body.email;
        session.email = email

        const user = await db.db.users.findOne({where: {email: email}});
        if(user) 
        {
            return res.status(200).json({message: "User exists!", redirect: "/login"})
        }
        else 
        {
        return res.status(200).json({redirect: "/signup"});
        }

    }

    catch(err)
    {
        console.error(err)
        return res.status(500).json(err.message)
    }
}

async function signUp(req, res) {
    try {
      const body = req.body;
      const email = body.email;
      const username = body.username;
  

      const findUser = await db.db.users.findOne({where: {email: email}});

      if(!(findUser == null)){
        return res.status(400).send("User with that email exists!")
      }

      if (!body.password) {
        return res.status(400).send('Password is required');
      }
  
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(body.password, salt);
  
      const user = await db.db.users.create({
        email: email,
        password: hash,
        username: username,
      });
  
      return res.status(201).json({ message: 'Account Created Successfully!' });
    } catch (err) {
      console.log(err);
      return res.status(400).send(err.message);
    }
  }
  

async function getURL(req, res) {

    
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
}

async function resetPassword(req, res){

    try{

    const body = req.body;
    const email = await body.email;

    const findUser = await db.db.users.findOne({where: {email: email}});
    if(!findUser) {
        return res.status(400).send("User does not exist!");
    }
    else {

        
     await  utils.transporter.sendMail(
        {
          from: "rwandagloria@gmail.com",
          to: body.email,
          subject: 'Nodemailer Project',
         html: `<h1>Hello ${findUser.name}! </h1> <h2> This is your link: ${confirmationURL}. It expires in two hours. `
        }, function(err, data) {
            if (err) {
              console.log("Error " + err);
            } else {
              console.log("Email sent successfully");
            }
          });
        return res.status(200).send(`We have sent an email to ${body.email} to confim the validity of the email. After receiving the email, follow the link provided to complete registration.`);
        
    } 
    

    }
    catch(err)
    {

        
    }

}


async function generateCustomLink(req, res) 
{

    const body = req.body;
    const customURL = body.customURL;
  
    Object.assign(body, 
    {
      user_id: req.user.id
    })
    const newURL = await db.db.URLs.create(body);
}

async function generate(url) {
    const urlLink = await db.db.URLs.findOne({where: { shortUrl: url}});

    if(urlLink){
       const newURL = await utils.generateTwoDigitAlphanumeric()
        return res.status(200).json({newURL: newURL});
    }

    else 
    {
        

    }
}
module.exports = { signUp, inputEmail, generateCustomLink, getURL, generateCustomURL, generateRandomURL, resetPassword, getURLData }