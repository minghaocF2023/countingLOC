import crypto from 'crypto';
import User from '../models/userModel.js';
import LoginController from './loginController.js';
// import { socketServer } from '../../app.js';

class UserController {
  // constructor() {
  //   socketServer.on('connection', (socket) => {
  //     this.socket = socket;
  //   });
  // }

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

  // /**
  //  * @deprecated
  //  * Validate new user's username and password
  //  */
  // static async validate(req, res) {
  //   const username = req.body.username.toLowerCase();
  //   const { password } = req.body;
  //   const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
  //   // duplicate username check
  //   const duplicateValidation = await User.getOne({
  //     username,
  //   });

  //   if (duplicateValidation !== null) {
  //     const hashedPassword = await User.hashPassword(
  //       password,
  //       Buffer.from(duplicateValidation.salt,'base64'),
  //     );
  //     if (hashedPassword === duplicateValidation.password) {
  //       res.status(200);
  //       res.json({ message: 'login' });
  //       // TODO
  //       return;
  //     }
  //     res.status(409);
  //     res.json({ message: 'Duplicated User' });
  //     return;
  //   }
  //   // validate username
  //   if (
  //     (username.length < 3) || User.BANNED_USERNAMES.includes(username)
  //     || (username.match(USERNAME_RULE) === null)
  //   ) {
  //     res.status(401);
  //     res.json({ message: 'Invalid Username' });
  //     return;
  //   }
  //   // validate password
  //   if (req.body.password.length < 4) {
  //     res.status(401);
  //     res.json({ message: 'Invalid Password' });
  //     return;
  //   }
  //   res.json({ message: 'OK' });
  // }

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
      res.json({ message: 'OK', token: LoginController.generateToken(data.username) });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Database error' });
    });
  }
}

export default UserController;
