import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
// import mongoose from '../services/db.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);
const FILE_PATH = path.resolve(__dirname, '../utils/banned_username.json');

/**
 * User class factory using given database connection
 *
 * @param {mongoose} mongoose database connection
 * @returns User class
 */
const userFactory = (mongoose) => {
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
      required: true,
      default: false,
    },
    // TODO: status, isAdmin: false
  });

  const UserModel = mongoose.model('User', UserSchema);

  class User extends UserModel {
    static BANNED_USERNAMES = JSON.parse(fs.readFileSync(FILE_PATH));

    /**
     * Get all users
     * @param {mongoose.FilterQuery<User>} filter
     * @param {mongoose.ProjectionType<User>?=} projection
     * @param {mongoose.QueryOptions<User>?=} options
     * @returns {Promise<User[]>} array of users
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((users) => users.map((user) => new User(user)));
    }

    /**
     * Get one user
     * @param {mongoose.FilterQuery<User>?} filter
     * @param {mongoose.ProjectionType<User>?=} projection
     * @param {mongoose.QueryOptions<User>?=} options
     * @returns {Promise<User | null>} user
     */
    static async getOne(filter, projection, options) {
      return this.findOne(filter, projection, options)
        .then((user) => (user ? new User(user) : null));
    }

    /**
     * Hash password with salt
     * @param {string} password plaintext password
     * @param {Buffer} salt base64 encoded salt
     * @returns {Promise<string>} base64 encoded hashed password
     */
    static async hashPassword(password, salt) {
      return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
          if (err) { reject(err); }
          resolve(hashedPassword.toString('base64'));
        });
      });
    }

    /**
     * Check if username is banned
     * @param {string} username in lowercase
     * @returns {boolean} true if username is banned
     */
    static isBannedUsername(username) {
      return this.BANNED_USERNAMES.includes(username);
    }

    /**
     * Check if username is taken
     * @param {string} username in lowercase
     * @returns {Promise<boolean>} true if username is taken
     */
    static async isUsernameTaken(username) {
      return this.exists({ username });
    }

    /**
     * Check if username is valid for registration. Does not check if username is taken.
     * @param {string} username in lowercase
     * @param {string} password plaintext password
     * @returns {boolean} true if username is valid according to rules
     */
    static isValidUsername(username) {
      const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
      return (
        username.length >= 3
        && !this.isBannedUsername(username)
        && USERNAME_RULE.test(username)
      );
    }

    /**
     * Check if password is valid
     * @param {string} password plaintext password
     * @returns {boolean} true if password is valid
     */
    static isValidPassword(password) {
      return password.length >= 4;
    }

    /**
     * Validate user credentials for login
     * @param {string} username in lowercase
     * @param {string} password plaintext password
     * @returns {Promise<boolean>} true if username and password match an existing user
     */
    static async validate(username, password) {
      const user = await this.findOne({ username });
      if (!user) {
        return false;
      }
      const hashedPassword = await this.hashPassword(password, Buffer.from(user.salt, 'base64'));
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

    /**
     * Get all online users
     * @returns {User[]} array of online users
     */
    static async retrieveOnlineUsers() {
      return this.get({ isOnline: true });
    }

    /**
     * Get all offline users
     * @returns {User[]} array of offline users
     */
    static async retrieveOfflineUsers() {
      return this.get({ isOnline: false });
    }
  }

  return User;
};

export default userFactory;
