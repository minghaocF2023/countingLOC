import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(filename);
const FILE_PATH = path.resolve(__dirname, '../../utils/banned_username.json');
const BANNED_USERNAMES = JSON.parse(fs.readFileSync(FILE_PATH));

/**
 * Check if username is banned
 * @param {string} username in lowercase
 * @returns {boolean} true if username is banned
 */
const isBannedUsername = (username) => BANNED_USERNAMES.includes(username);

/**
 * Check if username is valid for registration. Does not check if username is taken.
 * @param {string} username in lowercase
 * @param {string} password plaintext password
 * @returns {boolean} true if username is valid according to rules
 */
const isValidUsername = (username) => {
  const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
  return (
    username.length >= 3
      && !isBannedUsername(username)
      && USERNAME_RULE.test(username)
  );
};

/**
 * Check if username is valid for registration. Does not check if username is taken.
 * @param {string} username in lowercase
 * @param {string} password plaintext password
 * @returns {boolean} true if username is valid according to rules
 */
const isValidPassword = (password) => password.length >= 4;

export { isValidUsername, isValidPassword, isBannedUsername };
