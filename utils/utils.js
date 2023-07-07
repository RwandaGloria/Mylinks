require("dotenv").config();
const axios = require('axios');
const redis = require("redis");
const nodemailer = require('nodemailer');

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_HOST = process.env.REDIS_HOST;

const client = redis.createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: 11813
  }
});

async function checkURL(req, res, next) {
  try {
    const url = req.body.url;
    const response = await axios.head(url);
    if (response.status >= 200 && response.status < 400) {
      next();

    } else {
      return res.status(400).json({ message: "Broken URL!" })
    }
  } catch (error) {

    console.log(error);
    return res.status(500).json({ message: "An error occured!" });

  }
}

function generateShortURL() {
  var length = Math.floor(Math.random() * 6) + 2; // Generate a random length between 2 and 7
  var alphanumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';

  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * alphanumeric.length);
    result += alphanumeric.charAt(randomIndex);
  }
  return result;


}

function cache(req, res, next) {
  const key = "__express__" + req.originalUrl || req.url;

  client.get(key).then(reply => {

    if (reply) {
      res.send(JSON.parse(reply));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        //expire in 1 min
        client.set(key, JSON.stringify(body), { 'EX': 60 });
        res.sendResponse(body);
      };
      next();
    }
  }).catch(err => {
    console.log(err);
    res.status(500).send(err)
  });
}

async function sendEmail(receiverMail, subject, htmlBody) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD}
  });

  let info = await transporter.sendMail({
    from: process.env.MAIL_USERNAME,
    to: receiverMail,
    subject: subject,
    html: htmlBody,
  });

  console.log(info.messageId); 
}

module.exports = { checkURL, generateShortURL, cache, sendEmail, client }