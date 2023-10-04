/* eslint-disable import/no-extraneous-dependencies */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer } from 'http';
import User from '../models/userModel.js';
import socketServer from '../../app.js';

dotenv.config();
const TOKEN_SECRET = 'Some secret keys';


const onlineList = {};

class LoginController {
  socket = null;

  constructor() {
    socketServer.on('connection', (socket) => {
      this.socket = socket;
    });
  }

  async populateOnlineList() {
    try {
      const users = await User.get(); 
      users.forEach(user => {
        onlineList[user.username] = user.isOnline;
      });
      // console.log(onlineList); 
    } catch (error) {
      console.error('Error populating online list:', error);
    }
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
      res.status(403);
      res.json({ message: 'Incorrect username/password' });
      return;
    }


    const payload = { username: data.username };
    const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '3600s' });
    const username = req.params.username.toLowerCase();
    const user = await User.getOne({ username });

    // pass to socket
    await user.setOnline();
    onlineList[data.username] = true;
   
    socketServer.publishEvent('userOnlineStatus', { username: data.username, isOnline: true });

    res.status(200);
    res.json({ message: 'Login success', token, isOnline: true });
  }

  static async logoutUser(req, res) {
    if (!req.params.username) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username });

    // update onlineList
    await user.setOffline();
    onlineList[username] = false;
    socketServer.publishEvent('userOnlineStatus', { username, isOnline: false });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (!user.isOnline) {
      res.status(405).json({ message: 'User not logged in' });
    }

  }
}

export default LoginController;
