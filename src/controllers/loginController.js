/* eslint-disable import/no-extraneous-dependencies */
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer } from 'http';
import User from '../models/userModel.js';
// import socket from '../services/socket.js';
import { io } from '../../app.js';

// const httpServer = createServer();
// const io = new Server(httpServer);

// const io = socket;

const TOKEN_SECRET = 'Some secret key';

const onlineList = {};

// socket io?
// io.on('connection', (socket) => {
//   console.log('A socket connected:', socket.id);
//   socket.on('userOnline', async (username) => {
//     console.log('userOnline:', username);
//     const user = await User.findOne({ username: data.username });
//     await user.setOnline();
//     socket.broadcast('userOnline', username);
//   });

//   socket.on('disconnect', async () => {
//     console.log(`A user disconnected: ${socket.username} (${socket.id})`);
//     socket.broadcast('userOffline', username);
//     const user = await User.findOne({ username: data.username });
//     await user.setOffline();
//   });
// });

class LoginController {
  socket = null;

  constructor() {
    io.on('connection', (socket) => {
      this.socket = socket;
    });
  }

  static async loginUser(req, res) {
    // console.log("teat login");
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

    // TODO: Create token and response
    dotenv.config();
    // process.env.TOKEN_SECRET;
    const payload = { username: data.username };
    const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: '3600s' });
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username });

    // can this pass to frontend?
    await user.setOnline();
    onlineList[data.username] = true;
    // io.emit('userOnlineStatus', { username: data.username, isOnline: true });

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
    io.emit('userOnlineStatus', { username, isOnline: false });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (!user.isOnline) {
      res.status(405).json({ message: 'User not logged in' });
    }

    // await user.setOffline();
    // res.status(200).json({ message: 'OK', user: username });
  }
}

export default LoginController;
