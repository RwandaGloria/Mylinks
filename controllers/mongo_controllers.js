const bcrypt = require("bcrypt");
const session = require("express-session");
const QRCode = require('qrcode');
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cloudinary = require("cloudinary");

const redisClient = require("../utils/utils").client;
const utils = require("../utils/utils");
const URL = require("../mongo_model/url");
const User = require("../mongo_model/user");
const Token = require("../mongo_model/token");
const ClickData = require('../mongo_model/click_data');
const { generateToken } = require("../utils/utils");

const qrpath = path.join(__dirname, "QR");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

async function signUp(req, res) {
    try {
        const body = req.body;

        console.log("Request body: " + body.email);

        const email = body.email;
        const username = body.username;

        const findUser = await User.findOne({ email: email });

        if (findUser) {
            return res.status(400).send("User with that email exists!");
        }

        if (!body.password) {
            return res.status(400).send('Password is required');
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(body.password, salt);

        const user = await User.create({
            email: email,
            password: hash,
            username: username,
        });

        return res.status(201).json({ message: 'Account Created Successfully!' });
    } catch (err) {
        console.log(err);
        return res.status(500).send(err.message);
    }
}


async function inputEmail(req, res) {
    try {
        const email = req.body.email;
        session.email = email;

        const user = await User.findOne({ email: email });

        if (user) {
            return res.status(200).json({ message: "User exists!", redirect: "/login" });
        } else {
            return res.status(200).json({ redirect: "/signup" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json(err.message);
    }
}

async function sendPasswordResetLink(req, res) {

    try {

        const body = req.body;
        const email = await body.email;

        const findUser = await User.findOne({ email: email });
        if (!findUser) {
            return res.status(400).send("User does not exist!");
        } else {

            // Generate token
            const token = generateToken();

            // Calculate the expiry date (two hours from now)
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 2);

            // Create instance of token model and save to db (2 hrs)
            const tokenInstance = new Token({
                token: token,
                expiryDate: expiryDate
            });

            // Save the token instance to the database
            await tokenInstance.save();

            // Append token to URL
            const url = `http://localhost:8099/change-password/${findUser._id}/${token}`;

            await utils.sendEmail(email, 'Nodemailer Project', `<h1>Hello ${findUser.username}! </h1> <h2> This is your link: ${url}. It expires in two hours. `);

            return res.status(200).send(`We have sent an email to ${body.email} to confirm the validity of the email. After receiving the email, follow the link provided to complete registration.`);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send(err.message);
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.params.user;
        const token = req.params.token;

        const body = req.body;

        const findUser = await User.findOne({ _id: userId });

        if (!findUser) {
            return res.status(400).send("User with that email exists!");
        }

        if (!body.password) {
            return res.status(400).send('Password is required');
        }

        // Get the token from the database and check expiry
        const tokenModel = await Token.findOne({ token: token });
        const currentDate = new Date();

        if (tokenModel.expiryDate <= currentDate) {
            return res.status(400).send("The token has expired!");
        } else {
            // If the token is still valid, get the user password
            // from the request body and update it in the database
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(body.password, salt);

            const userModel = await User.findOneAndUpdate({ _id: userId }, { password: hash });

            res.status(200).send("Password changed successfully!");
        }

    } catch (err) {
        console.log(err);
        return res.status(400).send(err.message);
    }
}

async function generateRandomURL(req, res) {
    try {
        const body = req.body;
        const longURL = body.url;
        const base = "http://localhost:8099/";
        const shortURL = await utils.generateShortURL();
        const imageId = `${base}${shortURL}`;

        res.setHeader('Content-Type', 'application/json');

        const newURL = {
            longURL: longURL,
            shortURL: `${base}${shortURL}`
        };

        const qrCodeOptions = { type: 'jpeg' };
        const qrCodeFilePath = await QRCode.toFile(qrpath, `${shortURL}`, qrCodeOptions);

        const cloudinaryUploadOptions = { public_id: `${shortURL}` };
        const result = await cloudinary.v2.uploader.upload(qrpath, cloudinaryUploadOptions);
        console.log(result);
        fs.unlinkSync(qrpath);

        await redisClient.set(imageId, result.secure_url, 'EX', 3600);

        Object.assign(newURL, { QRCodeImage: result.secure_url });
        const createNewURL = await URL.create(newURL);

        console.log("!==== About to set header");

        // Return the response status and JSON data
        return res.status(201).json(createNewURL);
    } catch (err) {
        console.error(err);
        return res.status(400).send(err);
    }
}


async function generateCustomURL(req, res) {
    try {
        const body = req.body;
        const shortURL = body.shortURL;
        const longURL = req.body.longURL;
        const base = "http://localhost:8099/";
        const URLAppend = body.shortURL;
        const URLToAdd = `${base}${URLAppend}`;

        const checkIfURLExists = await URL.findOne({ shortURL: URLToAdd });

        console.log(checkIfURLExists);
        if (checkIfURLExists) {
            return res.status(400).json({ message: "That URL has been assigned to someone else. Please try again!" });
        } else {
            const newURL = {
                longURL: longURL,
                shortURL: `${base}${shortURL}`
            };

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
                        });
                    });

                    redisClient.set(URLToAdd, result.secure_url, 'EX', 3600, async (err) => {
                        if (err) {
                            console.error('Error saving image to Redis:', err);
                        } else {
                            res.setHeader('Content-Type', 'image/jpeg');
                            res.send(result.secure_url);
                        }
                    });

                    Object.assign(newURL, { QRCodeImage: result.secure_url });
                    const createNewURL = await URL.create(newURL);

                    return res.status(201).json(createNewURL);
                }
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}

async function getURLData(req, res) {
    try {
        const urlId = req.params.id;
        const findUrl = await URL.findOne({ _id: urlId });

        if (!findUrl) {
            return res.status(400).send("URL not found!");
        }

        return res.status(200).send(findUrl);
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
}

async function getURL(req, res) {
    try {
        const base = "http://localhost:8099/";
        const shortUrl = req.params.shortUrl;

        console.log("Short url: " + `${base}${shortUrl}`);

        const url = await URL.findOne({ shortURL: `${base}${shortUrl}` });

        console.log("URL data: " + url);

        if (!url) {
            return res.status(404).json({ message: "This URL does not exist!" });
        }

        const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        console.log("IP address: " + ipAddress);

        const ipData = await axios.get(`http://ip-api.com/json/${ipAddress}`) || "unknown";

        console.log("IP data: " + ipData.data);

        await URL.updateOne({ shortURL: `${base}${shortUrl}` }, { $inc: { linkClickCount: 1 } });

        console.log("Updated url count");

        await ClickData.create({
            link_id: url.id,
            Country: ipData.data.country || null,
            state: ipData.data.regionName || null
        });

        console.log("Created click data");
        return res.redirect(url.longURL);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err.message);
    }
}


module.exports = { signUp, inputEmail, sendPasswordResetLink, changePassword, generateRandomURL, generateCustomURL, getURLData, getURL };