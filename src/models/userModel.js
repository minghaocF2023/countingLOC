import mongoose from '../services/db.js';
import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

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
  }
  // TODO: status, isAdmin: false
});

const UserModel = mongoose.model('User', UserSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BANNED_USERNAMES = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../utils/banned_username.json')));

class User extends UserModel {
  static isBannedUsername(username) {
    return BANNED_USERNAMES.includes(username);
  }

  static async isUsernameTaken(username) {
    return await this.exists({ username });
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
}

export default User;
