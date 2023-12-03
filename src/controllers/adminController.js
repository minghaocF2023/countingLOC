import crypto from 'crypto';

import { isValidUsername, isValidPassword, isBannedUsername } from '../public/js/validation.js';
import authChecker from '../utils/authChecker.js';

class AdminController {
  constructor(userModel) {
    this.userModel = userModel;
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
    if (updateData.username && updateData.username !== usernameOfProfile) {
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
    socketServer.publishEvent('profileUpdate', {
      username: usernameOfProfile,
      newUsername: updateData.username || usernameOfProfile,
      isActive: updateData.isActive,
    });

    // TODO: handle NAME CHANGE
  }
}

export default AdminController;
