/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import crypto from 'crypto';
import JWT from '../utils/jwt.js';
import { isValidUsername, isValidPassword, isBannedUsername } from '../public/js/validation.js';
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

class UserController {
  constructor(userModel, profileModel) {
    this.userModel = userModel;
    this.profileModel = profileModel;
  }

  async getAllUsers(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }
    await this.userModel.get({}).then((users) => {
      const result = [];
      const taskList = [];
      this.userModel.getOne({ username: payload.username }).then(({ privilege, _id }) => {
        users.forEach((user) => {
          // filter out inactive users for non-admins
          if (privilege !== 'Administrator' && !user.isActive) {
            return;
          }
          if (user.profileId) {
            const task = this.profileModel.getOne({ _id: user.profileId }, 'profileImage doctorID').then((response) => {
              result.push({
                username: user.username,
                isOnline: user.isOnline,
                status: user.status,
                profileImage: response.profileImage,
                isContact: _id.equals(response.doctorID),
              });
            });
            taskList.push(task);
          } else {
            result.push({
              username: user.username,
              isOnline: user.isOnline,
              status: user.status,
              isContact: false,
            });
          }
        });
        Promise.all(taskList).then(() => {
          res.status(200);
          res.json({
            message: 'OK',
            users: result,
            banned_users: this.userModel.BANNED_USERNAMES,
          });
        }).catch((err) => {
          console.error(err);
          res.status(500);
          res.json({ message: 'Server error' });
        });
      });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
  }

  async getDoctorUsers(req, res) {
    const result = [];
    const taskList = [];
    this.userModel.getDoctors().then((users) => {
      users.forEach((user) => {
        const task = this.profileModel.getOne({ _id: user.profileId }, 'email').then((response) => {
          result.push({ _id: user._id, username: user.username, email: response.email });
        });
        taskList.push(task);
      });
      Promise.all(taskList).then(() => {
        res.status(200).json({ doctorList: result });
      });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    });
  }

  async getUserByUsername(req, res) {
    const username = req.params.username.toLowerCase();
    await this.userModel.getOne({ username }).then((user) => {
      if (user === null) {
        res.status(404);
        res.json({ message: isBannedUsername(username) ? 'Banned username' : 'User not found' });
      } else {
        res.status(200);
        res.json({
          message: 'OK',
          user: {
            username: user.username, isOnline: user.isOnline, status: user.status, isDoctor: user.isDoctor,
          },
        });
      }
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
  }

  async addDoctorIdentity(req, res, username) {
    try {
      const user = await this.userModel.findOne({ username: username.toLowerCase() });
      if (user) {
        await user.setDoctor();
        res.json({ message: 'Role updated successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error setting user as doctor:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getDoctorIdentity(req, res, username) {
    try {
      const user = await this.userModel.findOne({ username: username.toLowerCase() });
      if (user) {
        res.json({ isDoctor: user.getIsDoctor() });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error getting user doctor identity:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Store new user username and password into database
   */
  async createUser(req, res) {
    // validate request body
    if (req.body.username === undefined || req.body.password === undefined) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const data = {
      username: req.body.username.toLowerCase(),
      password: req.body.password,
      salt: '',
      isOnline: true,
    };
    // validate username and password
    if (!isValidUsername(data.username)
     || !isValidPassword(data.password)) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    // duplicate username check
    try {
      const isUsernameTaken = await this.userModel.isUsernameTaken(data.username);
      if (isUsernameTaken) {
        res.status(405);
        res.json({ message: 'Duplicated username' });
        return;
      }
    } catch (e) {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
      return;
    }
    // password encrypt
    const salt = crypto.randomBytes(16);
    const hashedPassword = await this.userModel.hashPassword(data.password, salt);
    data.password = hashedPassword;
    data.salt = salt.toString('base64');

    // eslint-disable-next-line new-cap
    const newUser = new this.userModel(data);

    // save to database
    await newUser.save().then(() => {
      res.status(201);
      const jwt = new JWT(process.env.JWTSECRET);
      res.json({ message: 'OK', token: jwt.generateToken(data.username) });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Database error' });
    });
  }

  async deleteUser(req, res) {
    this.userModel.findOneAndDelete({ username: req.body.username }).then(() => {
      res.status(200).json({ message: 'deleted' });
    });
  }
}

export default UserController;
