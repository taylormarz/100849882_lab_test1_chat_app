const express = require('express');
const userController = require('../controllers/UserController');

const router = express.Router();

router.post('/signup', userController.createAccount);

module.exports = router;