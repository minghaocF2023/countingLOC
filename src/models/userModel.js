/* eslint-disable no-underscore-dangle */
import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import mongoose from '../services/db.js';
// user class
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  isOnline: {
    type: Boolean,
  },
  // TODO: status, isAdmin: false
});

const UserModel = mongoose.model('User', UserSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BANNED_USERNAMES = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../utils/banned_username.json')));

class User extends UserModel {
  // static async find(...query) {
  //   return (await super.find(...query)).map((user) => new User(user));
  // }

  // static async findOne(...query) {

  //   return new User(await super.findOne(...query));
  // }

  /**
   * Encrypt password with salt
   * @param {string} password plaintext password
   * @param {Buffer} salt base64 encoded salt
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

  static isBannedUsername(username) {
    return BANNED_USERNAMES.includes(username);
  }

  static async isUsernameTaken(username) {
    return this.exists({ username });
  }

  static async isValidUsername(username) {
    const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
    return (
      username.length >= 3
      && !this.isBannedUsername(username)
      && !(await this.isUsernameTaken(username))
      && USERNAME_RULE.test(username)
    );
  }

  static async isValidPassword(password) {
    return password.length >= 4;
  }

  /**
   * Check user credentials for login
   * @param {string} username in lowercase
   * @param {string} password plaintext password
   */
  static async validate(username, password) {
    const user = await this.findOne({ username });
    if (!user) {
      return false;
    }
    const hashedPassword = await this.encryptPassword(password, Buffer.from(user.salt, 'base64'));
    return hashedPassword === user.password;
  }

  /**
   * Set user online status
   */
  async setOnline() {
    this.isOnline = true;
    await this.save();
  }

  /**
   * Set user offline status
   */
  async setOffline() {
    this.isOnline = false;
    await this.save();
  }

  static async retrieveOnlineUsers() {
    return this.find({ isOnline: true });
  }

  static async retrieveOfflineUsers() {
    return this.find({ isOnline: false });
  }
}

export default User;
