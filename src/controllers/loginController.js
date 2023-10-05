/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import JWT from '../utils/jwt.js';

dotenv.config();

const onlineList = {};

class LoginController {
  static async loginUser(req, res) {
    // check request is valid
    if (!req.params.username || (!req.body.password)) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const data = { username: req.params.username.toLowerCase() };

    if (!req.body.password) {
      res.status(400);
      res.json({ message: 'Invalid request' }); // maybe some other message
      return;
    }
    data.password = req.body.password;
    // validate user info
    if (!(await User.validate(data.username, data.password))) {
      res.status(404);
      res.json({ message: 'Incorrect username/password' });
      return;
    }

    const token = JWT.generateToken(data.username);

    res.status(200);
    res.json({ message: 'OK', token });
  }

  /**
   * Update user online status
   */
  static async updateOnlineStatus(req, res) {
    // if no token -> 403 error
    if (!req.headers.authorization) {
      res.status(403);
      res.json({ message: 'Unauthorized Request' });
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    const payload = JWT.verifyToken(token);
    // check username
    if (!req.params.username) {
      res.status(400);
      res.json({ message: 'No username passed' });
      return;
    }

    const username = req.params.username.toLowerCase();
    // check token isValid?
    if (payload === null || payload.username !== username) {
      res.status(403);
      res.json({ message: 'Unauthorized Request' }); // maybe some other message
      return;
    }

    try {
      // update database user status
      const user = await User.getOne({ username });
      await user.setOnline();
      onlineList[username] = true;
    } catch (error) {
      console.error('Error setting user online:', error);
      res.status(500);
      res.json({ message: 'Server error' });
      return;
    }
    // socket broadcast
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('userOnlineStatus', { username, isOnline: true });
  }

  // update user offline status
  static async logoutUser(req, res) {
    if (!req.params.username) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const username = req.params.username.toLowerCase();

    try {
      const user = await User.getOne({ username });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      if (!user.isOnline) {
        res.status(405).json({ message: 'User not logged in' });
        return;
      }

      // update onlineList
      await user.setOffline();
      onlineList[username] = false;
    } catch (error) {
      console.error('Error setting user offline:', error);
      res.status(500);
      res.json({ message: 'Server error' });
      return;
    }

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('userOnlineStatus', { username, isOnline: false });

    res.status(200);
    res.json({ message: 'OK' });
  }
}

export default LoginController;
