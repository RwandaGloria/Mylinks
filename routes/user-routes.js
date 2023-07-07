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


/**
 * @swagger
 * /user/custom-url:
 *   post:
 *     summary: Generate custom URL
 *     description: Generates a custom URL for a given long URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longURL:
 *                 type: string
 *                 description: The long URL to be shortened.
 *               shortURL:
 *                 type: string
 *                 description: The custom short URL to be assigned.
 *     responses:
 *       '201':
 *         description: Custom URL created successfully.
 *       '400':
 *         description: Bad request - The short URL is already assigned to someone else.
 *       '500':
 *         description: Internal server error - An error occurred during URL generation.
 */

userRouter.post("/user/custom-url", validator.validateCustomURLRoute, 
async(req, res) => {

  controllers.generateCustomURL(req, res)
});

 /**
 * @swagger
 * /user/generate-url:
 *   post:
 *     summary: Generate random URL
 *     description: Generates a random URL for a given long URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The long URL to be shortened.
 *     responses:
 *       '200':
 *         description: URL generated successfully.
 *       '400':
 *         description: Bad request - The URL is broken.
 *       '500':
 *         description: Internal server error - An error occurred during URL generation.
 */
   
userRouter.post("/user/generate-url", validator.validateURLRoute, utils.checkURL, async (req, res) => {
  controllers.generateRandomURL(req, res);
});

/**
 * @swagger
 * /user/allURLs:
 *   get:
 *     summary: Get all URLs for a user
 *     description: Retrieves all URLs associated with the authenticated user.
 *     responses:
 *       '200':
 *         description: Success - URLs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the URL.
 *                   longURL:
 *                     type: string
 *                     description: The long URL.
 *                   shortURL:
 *                     type: string
 *                     description: The short URL.
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp of when the URL was created.
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp of when the URL was last updated.
 *       '500':
 *         description: Internal server error - An error occurred while retrieving the URLs.
 */

  userRouter.get("/user/allURLs", async (req, res) => {
    const userId = req.user.id;
    const userURLs = await db.db.URLs.findAll({
        where: {
            user_id: userId
        }
    });
    return res.status(200).json(userId);
  })
/**
 * @swagger
 * /user/data/{id}:
 *   get:
 *     summary: Get URL data by ID
 *     description: Retrieves the data for a specific URL based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the URL to retrieve data for.
 *     responses:
 *       '200':
 *         description: Success - URL data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The ID of the URL.
 *                 longURL:
 *                   type: string
 *                   description: The long URL.
 *                 shortURL:
 *                   type: string
 *                   description: The short URL.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of when the URL was created.
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of when the URL was last updated.
 *       '400':
 *         description: Bad request - URL not found.
 */
  userRouter.get("/user/data/:id", async (req, res) => {
    //input the URL id 
    controllers.getURLData(req, res); 
  })

  module.exports = {userRouter}