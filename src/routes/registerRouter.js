const express = require('express');
const registerController = require('../controllers/registerController');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/api/users/register', registerController.registerUser);

module.exports = router;
