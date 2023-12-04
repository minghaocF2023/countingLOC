/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
// import * as fs from 'fs';
// import path, { dirname } from 'path';
// import { fileURLToPath } from 'url';
import crypto from 'crypto';
import mongoose from 'mongoose';

// eslint-disable-next-line no-underscore-dangle
// const filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
// const __dirname = dirname(filename);
// const FILE_PATH = path.resolve(__dirname, '../utils/banned_username.json');

/**
 * User class factory using given database connection
 *
 * @param {mongoose} mongoose database connection
 * @returns User class
 */
const userFactory = (connection) => {
  // user class
  // console.log(connection);
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
    chatrooms: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'Chatroom' }],
      required: false,
    },
    profileId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    isOnline: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      default: 'Undefined',
      enum: ['OK', 'Help', 'Emergency', 'Undefined'],
    },
    statusTimestamp: {
      type: Date,
      default: Date.now,
    },
    isDoctor: {
      type: Boolean,
      required: true,
      default: false,
    },
    privilege: {
      type: String,
      enum: ['Citizen', 'Coordinator', 'Administrator'],
      default: 'Citizen',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  });

  let UserModel;
  if (connection.models.User) {
    UserModel = connection.models.User;
  } else {
    UserModel = connection.model('User', UserSchema);
  }

  class User extends UserModel {
    // static BANNED_USERNAMES = JSON.parse(fs.readFileSync(FILE_PATH));

    static async getIdByUsername(username) {
      try {
        return (await this.findOne({ username }))._id;
      } catch (error) {
        console.error(error);
        console.error(`Error getting user id for username ${username}`);
      }
      return null;
    }

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

    static async updateDoc(filter, projection, options) {
      return this.updateOne(filter, projection, options).then((user) => {
        console.error(`updated: ${user}`);
      }).catch((error) => {
        console.error(`error while updating: ${error}`);
      });
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
     * Check if username is taken
     * @param {string} username in lowercase
     * @returns {Promise<boolean>} true if username is taken
     */
    static async isUsernameTaken(username) {
      return this.exists({ username });
    }

    static createUser(data) {
      const user = new this(data);
      return user;
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
      await this.updateOne({ isOnline: true });
    }

    /**
     * Set user offline status
     */
    async setOffline() {
      await this.updateOne({ isOnline: false });
    }

    async getUserProfileId(username) {
      const id = await User.findOne({ username }, 'profileId');
      return id;
    }

    static async getDoctors() {
      const list = await User.find({ profileId: { $exists: true, $ne: null } }, '_id username profileId');
      return list;
    }

    async updateUserProfileId(username, id) {
      User.findOneAndUpdate({ username }, { profileId: id }, { new: true }).catch(
        (err) => console.error(err),
      );
    }

    /**
     * Set user doctor status
     */
    async setDoctor() {
      await this.updateOne({ isDoctor: true });
    }

    /**
     * Set user privilege level
     * @param {string} privilege new privilege level
     * @returns {Promise<void>}
     */
    async setPrivilege(privilege) {
      const validPrivileges = ['Citizen', 'Coordinator', 'Administrator'];
      if (!validPrivileges.includes(privilege)) {
        throw new Error(`Invalid privilege: ${privilege}. Valid privileges are ${validPrivileges.join(', ')}.`);
      }

      await this.updateOne({ privilege });
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

    // TODO: all getters
    getUserId() {
      // eslint-disable-next-line no-underscore-dangle
      return this._id;
    }

    getUsername() {
      return this.username;
    }

    getPassword() {
      return this.password;
    }

    getSalt() {
      return this.salt;
    }

    getChatrooms() {
      return this.chatrooms;
    }

    getIsOnline() {
      return this.isOnline;
    }

    getIsDoctor() {
      return this.isDoctor;
    }

    getPrivilege() {
      return this.privilege;
    }
  }

  return User;
};

export default userFactory;
