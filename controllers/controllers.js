const db = require("../db");
const session = require("express-session");
const bcrypt = require("bcrypt");
const utils = require("../utils/utils");


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

    const body = req.body
    const email = body.email;
    const username = body.username;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(body.password, salt);

    const user = await db.db.users.create(
        {
            email: body.email,
            password: hash,
            username: username
        }
    );
    return res.status(201).json({message: "Account Created Successfully!"});
    }


    catch(err) {
        console.error(err);
        return res.status(400).send(err.message);
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
module.exports = { signUp, inputEmail, generateCustomLink }