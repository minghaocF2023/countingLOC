/* eslint-disable import/no-extraneous-dependencies */
// import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
// import { createServer } from 'http';
import User from '../models/userModel.js';
import { socketServer } from '../../app.js';

dotenv.config();
const TOKEN_SECRET = 'Some secret keys';

const onlineList = {};

class LoginController {
  // constructor() {
  //   socketServer.on('connection', (socket) => {
  //     this.socket = socket;
  //   });
  // }

  // async populateOnlineList() {
  //   try {
  //     const users = await User.get();
  //     users.forEach((user) => {
  //       onlineList[user.username] = user.isOnline;
  //     });
  //     // console.log(onlineList);
  //   } catch (error) {
  //     console.error('Error populating online list:', error);
  //   }
  // }

  static generateToken(username) {
    const payload = { username };
    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '3600s' });
  }

  static verifyToken(token) {
    return jwt.verify(token, TOKEN_SECRET);
  }

  static async loginUser(req, res) {
    if (!req.params.username || !req.body.password) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const data = {
      username: req.params.username.toLowerCase(),
      password: req.body.password,
    };

    if (!(await User.validate(data.username, data.password))) {
      res.status(404);
      res.json({ message: 'Incorrect username/password' });
      return;
    }

    const token = LoginController.generateToken(data.username);

    try {
      // pass to socket
      const user = await User.getOne({ username: data.username });
      await user.setOnline();
      onlineList[data.username] = true;
    } catch (error) {
      console.error('Error setting user online:', error);
      res.status(500);
      res.json({ message: 'Server error' });
      return;
    }

    socketServer.publishEvent('userOnlineStatus', { username: data.username, isOnline: true });

    res.status(200);
    res.json({ message: 'OK', token });
  }

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

    socketServer.publishEvent('userOnlineStatus', { username, isOnline: false });

    res.status(200);
    res.json({ message: 'OK' });
  }
}

export default LoginController;
