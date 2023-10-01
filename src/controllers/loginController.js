import crypto from 'crypto';
import * as fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../models/userModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BANNED_USERNAMES = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../utils/banned_username.json')));

class LoginController{

    static async loginUser(req, res) {
        const username = req.params.username.toLowerCase();
        res.json({ message: 'Login success', user: username });
        // TODO: Create token and response
        // TODO: socket.io status change
      }
    
      static async logoutUser(req, res) {
        const username = req.params.username.toLowerCase();
        res.json({ message: 'Logout success', user: username });
        // TODO
      }

}

export default LoginController;