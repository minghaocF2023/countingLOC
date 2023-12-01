/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import JWT from '../utils/jwt.js';
import testChecker from '../utils/testChecker.js';
import authChecker from '../utils/authChecker.js';

dotenv.config();

const onlineList = {};

class LoginController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async loginUser(req, res) {
    // check request is valid
    if (!req.params.username || (!req.body.password)) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const data = { username: req.params.username.toLowerCase() };

    if (!req.body.password) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    data.password = req.body.password;
    // validate user info
    if (!(await this.userModel.validate(data.username, data.password))) {
      res.status(404);
      res.json({ message: 'Incorrect username/password' });
      return;
    }
    const jwt = new JWT(process.env.JWTSECRET);
    const token = jwt.generateToken(data.username);

    const { privilege } = await this.userModel.getOne({ username: data.username });

    res.status(200);
    res.json({ message: 'OK', token, privilege });
  }

  /**
   * Update user online status
   */
  async updateOnlineStatus(req, res) {
    // if no token -> 403 error
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }
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
    let status;
    try {
      // update database user status
      const user = await this.userModel.getOne({ username });
      await user.setOnline();
      onlineList[username] = true;
      status = user.status;
    } catch (error) {
      console.error('Error setting user online:', error);
      res.status(500);
      res.json({ message: 'Server error' });
      return;
    }
    // socket broadcast
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('userOnlineStatus', { username, isOnline: true, status });

    res.status(200).json({ message: 'OK' });
  }

  // update user offline status
  async logoutUser(req, res) {
    if (!req.params.username) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const username = req.params.username.toLowerCase();

    try {
      const user = await this.userModel.getOne({ username });

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
