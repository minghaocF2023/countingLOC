const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/acknowledge', (req, res) => {
  res.render('acknowledge');
});

router.post('/api/users/validateUser', userController.validateUser);
router.post('/api/users/register', userController.registerUser);

module.exports = router;
