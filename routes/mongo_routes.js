const express = require('express');
const mongoController = require('../controllers/mongo_controllers');

const router = express.Router();

router.get('/url/:id', mongoController.getURLData);
router.post('/url/generate/random', mongoController.generateRandomURL);
router.post('/url/generate/custom', mongoController.generateCustomURL);
router.post('/email', mongoController.inputEmail);
router.post('/signup', mongoController.signUp);
router.get('/:shortUrl', mongoController.getURL);
router.post('/reset-password', mongoController.sendPasswordResetLink);
router.post('/change-password/:user/:token', mongoController.changePassword);

module.exports = router;