const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/api/users/validateUser', UserController.validateUser);
router.post('/api/users/register', UserController.registerUser);

module.exports = router;
