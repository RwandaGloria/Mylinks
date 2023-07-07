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

/**
 * @swagger
 * /Routes:
 *   get:
 *     summary: Testing purposes
 *     description: Just to test a GET route.
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: Hello
 *                   description: Success message
 */

router.get("/home/hi", async (req, res) => {
  res.status(200).json({message: "Hello!"});

});
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 description: User's password.
 *     responses:
 *       '302':
 *         description: Redirects to the home page after successful login.
 *       '401':
 *         description: Unauthorized - Invalid email or password.
 */

router.post("/login", passport.authenticate('local-login'), async (req, res) => {

  res.status(302).redirect("/home");
});

router.post("/reset/password", async (req, res) => {

  controllers.resetPassword(req, res);
});

/**
 * @swagger
 * /{shortUrl}:
 *   get:
 *     summary: Get long URL from short URL
 *     description: Retrieves the long URL associated with the provided short URL.
 *     parameters:
 *       - in: path
 *         name: shortUrl
 *         required: true
 *         description: Short URL identifier.
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirects to the long URL.
 *       '404':
 *         description: URL not found.
 */

router.get("/:shortUrl", async (req, res) => {
  controllers.getURL(req, res);
})


/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User sign up
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email address.
 *               username:
 *                 type: string
 *                 description: User's username.
 *               password:
 *                 type: string
 *                 description: User's password.
 *     responses:
 *       '201':
 *         description: Account created successfully.
 *       '400':
 *         description: Bad request - User with that email exists or password is missing.
 *       '406':
 *         description: Unacceptable - Password needs characters to be at least 6 characters long.
 */
router.post("/signup", validator.validateSignUp, async (req, res) => 
{
    const body = req.body;
    controllers.signUp(req, res);
})
module.exports = {router}