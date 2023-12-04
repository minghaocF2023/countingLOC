/* eslint-disable class-methods-use-this */
import crypto from 'crypto';
import dotenv from 'dotenv';

import JWT from '../utils/jwt.js';
import { isValidUsername, isValidPassword } from '../public/js/validation.js';

dotenv.config();

class AdminController {
  constructor(userModel) {
    this.userModel = userModel;
    this.createInitialAdmin();
  }

  async createInitialAdmin() {
    this.userModel.find({ privilege: 'Administrator' }).then((admins) => {
      if (admins.length === 0) {
        console.log(admins.length);
        const salt = crypto.randomBytes(16);
        this.userModel.hashPassword('admin', salt).then((hashedPassword) => {
          this.userModel.findOneAndUpdate({ username: 'esnadmin' }, {
            username: 'esnadmin',
            password: hashedPassword,
            salt: salt.toString('base64'),
            privilege: 'Administrator',
            isActive: true,
            status: 'OK',
            isOnline: false,
            isDoctor: false,
          }, { upsert: true, new: true }).then((admin) => {
            console.log(admin);
          });
        });
      }
    });
  }

  async getUserProfile(req, res) {
    const { username } = req.params;
    const userProfile = await this.userModel.findOne({ username }).select('-_id username isActive privilege');
    if (!userProfile) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'Success', userProfile });
  }

  async updateUserProfile(req, res) {
    const updateData = req.body;
    const usernameOfProfile = req.params.username; // old username

    // if username is to be changed
    if (updateData.username && updateData.username.toLowerCase() !== usernameOfProfile) {
      updateData.username = updateData.username.toLowerCase();
      if (await this.userModel.isUsernameTaken(updateData.username)) {
        res.status(409).json({ message: 'Username already taken' });
        return;
      }
      if (!isValidUsername(updateData.username)) {
        res.status(400).json({ message: 'Invalid username' });
        return;
      }
    }

    // handle password
    if (updateData.password) {
      if (!isValidPassword(updateData.password)) {
        res.status(400).json({ message: 'Invalid password' });
        return;
      }
      // password encrypt
      const salt = crypto.randomBytes(16);
      const hashedPassword = await this.userModel.hashPassword(updateData.password, salt);
      updateData.password = hashedPassword;
      updateData.salt = salt.toString('base64');
    }

    // handle at least one admin
    if (updateData.privilege && updateData.privilege !== 'Administrator') {
      const admins = await this.userModel.find({ privilege: 'Administrator' });
      if (admins.length === 1 && admins[0].username === usernameOfProfile) {
        res.status(400).json({ message: 'Cannot remove the only administrator' });
        return;
      }
    }

    // eslint-disable-next-line max-len
    const oldUser = await this.userModel.findOneAndUpdate({ username: usernameOfProfile }, updateData);
    if (!oldUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userProfile = await this.userModel.findOne({ username: updateData.username }).select('-_id username isActive privilege');
    res.status(200).json({ message: 'User profile successfully updated', userProfile });

    // handle active/inactive
    const socketServer = req.app.get('socketServer');
    const jwt = new JWT(process.env.JWTSECRET);
    socketServer.sendToPrivate('profileUpdate', usernameOfProfile, {
      username: usernameOfProfile,
      newUsername: updateData.username || usernameOfProfile,
      token: jwt.generateToken(updateData.username || usernameOfProfile),
      isActive: updateData.isActive,
    });
  }

  async updateUserEmergencyStatus(req, res) {
    res.status(403).json({ message: 'Admins do not have the right to change user status' });
  }
}

export default AdminController;
