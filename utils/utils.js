require("dotenv").config();
const axios = require('axios');
const redis = require("redis");

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
      
    } else 
    {
    return res.status(400).json({message: "Broken URL!"})
    }
  } catch (error) {

    console.log(error);
    return res.status(500).json({message: "An error occured!"});
    
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
          client.set(key, JSON.stringify(body), {'EX':60});
          res.sendResponse(body);
        };
        next();
      }
    }).catch(err=>{
      console.log(err);
      res.status(500).send(err)
    });
  }
  

  async function sendEmail() {
    
    await  utils.transporter.sendMail(
      {
        from: "rwandagloria@gmail.com",
        to: body.email,
        subject: 'Nodemailer Project',
       html: `<h1>Hello Gloria! </h1> <h2> This is your link: ${confirmationURL}. It expires in two hours. `
      }, function(err, data) {
          if (err) {
            console.log("Error " + err);
          } else {
            console.log("Email sent successfully");
          }
        });
      return res.status(200).send(`We have sent an email to ${body.email} to confim the validity of the email. After receiving the email, follow the link provided to complete registration.`);
      
  }

  module.exports = { checkURL, generateShortURL, cache, client }