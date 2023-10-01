/* eslint-disable no-underscore-dangle */
import crypto from 'crypto';
import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BANNED_USERNAMES = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../utils/banned_username.json')));

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
    await User.find({}).then((users) => {
      res.status(200);
      res.json({ message: 'OK', users: users.map((user) => user.username), banned_users: BANNED_USERNAMES });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
  }

  static async getUserByUsername(req, res) {
    const username = req.params.username.toLowerCase();
    await User.findOne({ username }).then((user) => {
      if (user === null) {
        res.status(404);
        res.json({ message: BANNED_USERNAMES.includes(username) ? 'Banned username' : 'User not found' });
      } else {
        res.status(200);
        res.json({ message: 'OK', user: user.username });
      }
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
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
   * @deprecated
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
    // validate request body
    if (req.body.username === undefined || req.body.password === undefined) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const data = {
      username: req.body.username.toLowerCase(),
      password: req.body.password,
      salt: '',
    };
    // duplicate username check
    await User.findOne({ username: data.username }).then((user) => {
      if (user !== null) {
        res.status(405);
        res.json({ message: 'Duplicated username' });
      }
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
    // password encrypt
    const salt = crypto.randomBytes(16);
    const hashedPassword = await UserController.encryptPassword(data.password, salt);
    data.password = hashedPassword;
    data.salt = salt.toString('base64');

    const newUser = new User(data);

    // save to database
    await newUser.save().then(() => {
      res.status(201);
      res.json({ message: 'OK', token: 'placeholder' });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Database error' });
    });
  }
}

export default UserController;
