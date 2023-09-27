const crypto = require('crypto');
const User = require('../models/userModel');
const BANNED_USERNAMES = require('../utils/banned_username.json');

class UserController {
  /**
   * Encrypt password with salt
   * @param {string} password plaintext password
   * @param {string} salt base64 encoded salt
   * @returns base64 encoded hashed password
   */
  static encryptPassword(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) { reject(err); }
        resolve(hashedPassword.toString('base64'));
      });
    });
  }

  static async getAllUsers(req, res) {
    const users = await User.find().select({ username: 1 });
    res.json({ message: 'OK', users, banned_users: BANNED_USERNAMES });
  }

  static async getUserByUsername(req, res) {
    const { username } = req.params;
    const user = await User.findOne({ username }).select({ username: 1 });
    res.json({ message: 'OK', user });
    // TODO: error states
  }

  static async loginUser(req, res) {
    const username = req.params.username.toLowerCase();
    res.json({ message: 'Login success', user: username });
    // TODO
  }

  static async logoutUser(req, res) {
    const username = req.params.username.toLowerCase();
    res.json({ message: 'Logout success', user: username });
    // TODO
  }

  /**
  * Validate new user's username and password
  */
  static async validate(req, res) {
    const username = req.body.username.toLowerCase();
    const { password } = req.body;
    const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
    // duplicate username check
    const duplicateValidation = await User.findOne({
      username,
    });

    if (duplicateValidation !== null) {
      const hashedPassword = await UserController.encryptPassword(password, Buffer.from(duplicateValidation.salt, 'base64'));
      if (hashedPassword === duplicateValidation.password) {
        res.status(200);
        res.json({ message: 'login' });
        return;
      }
      res.status(409);
      res.json({ message: 'Duplicated User' });
      return;
    }
    // validate username
    if (
      (username.length < 3) || BANNED_USERNAMES.includes(username)
      || (username.match(USERNAME_RULE) === null)
    ) {
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
  }

  /**
   * Store new user username and password into database
   */
  static async createUser(req, res) {
    // TODO: validate username and password
    const data = {
      username: req.body.username.toLowerCase(),
      password: req.body.password,
      salt: '',
    };

    // password encrypt
    const salt = crypto.randomBytes(16);
    const hashedPassword = await UserController.encryptPassword(data.password, salt);
    data.password = hashedPassword;
    data.salt = salt.toString('base64');

    const newUser = new User(data);

    // save to database
    await newUser.save().then(() => {
      res.status(200);
      res.json({ message: 'Registration success' });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Database error' });
    });
  }
}

module.exports = UserController;
