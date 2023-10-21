import crypto from 'crypto';
import { User } from '../models/models.js';
import JWT from '../utils/jwt.js';

class UserController {
  static async getAllUsers(_req, res) {
    await User.get({}).then((users) => {
      res.status(200);
      res.json({
        message: 'OK',
        users: users.map(({ username, isOnline }) => ({ username, isOnline })),
        banned_users: User.BANNED_USERNAMES,
      });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
  }

  static async getUserByUsername(req, res) {
    const username = req.params.username.toLowerCase();
    await User.getOne({ username }).then((user) => {
      if (user === null) {
        res.status(404);
        res.json({ message: User.isBannedUsername(username) ? 'Banned username' : 'User not found' });
      } else {
        res.status(200);
        res.json({ message: 'OK', user: { username: user.username, isOnline: user.isOnline } });
      }
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Server error' });
    });
  }

  /**
   * Store new user username and password into database
   */
  static async createUser(req, res) {
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
    if (!User.isValidUsername(data.username) || !User.isValidPassword(data.password)) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    // duplicate username check
    try {
      const isUsernameTaken = await User.isUsernameTaken(data.username);
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
    const hashedPassword = await User.hashPassword(data.password, salt);
    data.password = hashedPassword;
    data.salt = salt.toString('base64');

    const newUser = new User(data);

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

  // static async updateStatus(req, res) {
  //   res.status(501).json({ message: 'Not implemented' });
  // }

  // static async getStatusHistory(req, res) {
  //   res.status(501).json({ message: 'Not implemented' });
  // }
}

export default UserController;
