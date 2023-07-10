const express = require('express');
const mongoController = require('../controllers/mongo_controllers');

const router = express.Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Signing up
 *     description: Creates an account for the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's email address.
 *               email:
 *                 type: string
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 description: User's password.
 *     responses:
 *       '400':
 *         description: Unauthorized - Invalid email or password.
 */
router.post('/signup', mongoController.signUp);

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
router.post('/login', mongoController.login);

/**
 * @swagger
 * /email:
 *   post:
 *     summary: Check user exists.
 *     description: Check if user exists in database with email.
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
 *     responses:
 *       '302':
 *         description: Redirects to the home page after successful login.
 *       '401':
 *         description: Unauthorized - Invalid email or password.
 */
router.post('/email', mongoController.inputEmail);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Send password reset link
 *     description: Send a password reset link to the provided email address.
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
 *     responses:
 *       '200':
 *         description: Password reset link sent
 *         schema:
 *           type: string
 *       '400':
 *         description: Bad Request
 *         schema:
 *           type: string
 */
router.post('/reset-password', mongoController.sendPasswordResetLink);

/**
 * @swagger
 * /change-password/{user}/{token}:
 *   post:
 *     summary: Change user password
 *     description: Change the password of the user with the provided user ID and token.
 *     parameters:
 *       - name: user
 *         in: path
 *         description: User ID
 *         required: true
 *         type: string
 *       - name: token
 *         in: path
 *         description: Token
 *         required: true
 *         type: string
 *       - name: body
 *         in: body
 *         description: New password
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *         schema:
 *           type: string
 *       '400':
 *         description: Bad Request
 *         schema:
 *           type: string
 */
router.post('/change-password/:user/:token', mongoController.changePassword);

/**
 * @swagger
 * /url/generate/random:
 *   post:
 *     summary: Generate random URL
 *     description: Generate a random URL with a QR code image.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longURL:
 *                 type: string
 *                 description: The long URL.
 *               userId:
 *                 type: string
 *                 description: The user's ID.
 *     responses:
 *       '201':
 *         description: URL and QR code generated successfully
 *         schema:
 *           $ref: '#/definitions/URL'
 *       '400':
 *         description: Bad Request
 *         schema:
 *           type: string
 */
router.post('/url/generate/random', mongoController.generateRandomURL);

/**
 * @swagger
 * /url/generate/custom:
 *   post:
 *     summary: Generate custom URL
 *     description: Generate a custom URL with a QR code image.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               longURL:
 *                 type: string
 *                 description: The long URL.
 *               shortURL:
 *                 type: string
 *                 description: The long URL.
 *               userId:
 *                 type: string
 *                 description: The user's ID.
 *     responses:
 *       '201':
 *         description: URL and QR code generated successfully
 *         schema:
 *           $ref: '#/definitions/URL'
 *       '400':
 *         description: Bad Request
 *         schema:
 *           type: string
 */
router.post('/url/generate/custom', mongoController.generateCustomURL);

/**
 * @swagger
 * /url/{id}:
 *   get:
 *     summary: Get URL data
 *     description: Get the data of a URL by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: URL ID
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: URL data retrieved successfully
 *         schema:
 *           $ref: '#/definitions/URL'
 *       '404':
 *         description: URL not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
router.get('/url/:id', mongoController.getURLData);


/**
 * @swagger
 * /{shortUrl}:
 *   get:
 *     summary: Get URL
 *     description: Get the long URL associated with the provided short URL.
 *     parameters:
 *       - name: shortUrl
 *         in: path
 *         description: Short URL
 *         required: true
 *         type: string
 *     responses:
 *       '302':
 *         description: Redirects to the long URL
 *       '404':
 *         description: Short URL not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
router.get('/:shortUrl', mongoController.getURL);

/**
 * @swagger
 * /url/all/{userId}:
 *   get:
 *     summary: Get all URLs
 *     description: Get all URLs associated with the provided user ID.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User ID
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: URLs retrieved successfully
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/URL'
 */
router.get('/url/all/:userId', mongoController.getAllURLs)

module.exports = router;