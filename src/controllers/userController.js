const crypto = require('crypto');
const User = require('../models/userModel');
const BANNED_USERNAME = require('../utils/banned_username.json');

const userController = {
  /**
   * Validate new user's username and password
   */
  validateUser: async (req, res) => {
    // duplicate username check
    const duplicateValidation = await User.findOne({
      username: req.body.username,
    });

    if (duplicateValidation !== null) {
      res.status(409);
      res.json({ message: 'Duplicated User' });
      return;
    }
    // validate username
    if ((req.body.username.length < 3) || BANNED_USERNAME.includes(req.body.username)) {
      res.status(401);
      res.json({ message: 'Invalid Username' });
      return;
    }
    // validate password
    if (req.body.password.length < 4) {
      res.status(401);
      res.json({ message: 'Invalid Password' });
      return;
    }

    res.json({ message: 'OK' });
  },

  /**
   * Store new user username and password into database
   */
  registerUser: async (req, res) => {
    const data = {
      username: req.body.username,
      password: req.body.password,
      salt: '',
    };

    // password encrypt
    const salt = crypto.randomBytes(16);

    crypto.pbkdf2(data.password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
      if (err) { console.error(err); }
      data.password = hashedPassword.toString('base64');
      data.salt = salt.toString('base64');

      const newUser = new User({
        username: data.username,
        password: data.password,
        salt: data.salt,
      });

      // save to database
      await newUser.save().then(() => {
        res.status(200);
        res.json({ message: 'Registration success' });
      }).catch((e) => {
        console.error(e);
        res.status(500);
        res.json({ message: 'Database error' });
      });
    });
  },
};

module.exports = userController;
