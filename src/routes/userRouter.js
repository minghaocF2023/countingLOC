/**
 * @swagger
 * components:
 *   schemas:
 *     Username:
 *       type: string
 *       description: User's username
 *       example: testUser
 *     StatusHistory:
 *       type: object
 *       description: User's status
 *       properties:
 *         timestamp:
 *           type: string
 *           description: status time
 *           example: 1970-01-01 00:00:00
 *         status:
 *           type: string
 *           description: status code
 *           example: "GREEN"
 *
 *     UserPassword:
 *       type: string
 *       description: User's password
 *       example: testPassword
 *     UserToken:
 *       type: string
 *       description: User's JWT token
 *     UserOnlineStatus:
 *       type: boolean
 *       example: false
 *     User:
 *       type: object
 *       description: User entries for frontend
 *       properties:
 *         username:
 *           $ref: '#/components/schemas/Username'
 *         isOnline:
 *           $ref: '#/components/schemas/UserOnlineStatus'
 *     UserList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/User'
 *     UsernameList:
 *       type: array
 *       description: List of usernames
 *       items:
 *         $ref: '#/components/schemas/Username'
 *     NewUser:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           $ref: '#/components/schemas/Username'
 *         password:
 *           $ref: '#/components/schemas/UserPassword'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Response:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 *           example: OK
 */

/**
 * @swagger
 * parameters:
 *   username:
 *     name: username
 *     in: path
 *     description: Username of a user
 *     required: true
 *     schema:
 *       type: string
 *     example: testUser
 *   status:
 *     name: status
 *     in: path
 *     description: current status
 *     required: true
 *     schema:
 *       type: string
 *     example: GREEN
 */

import express from 'express';
import UserController from '../controllers/userController.js';
import LoginController from '../controllers/loginController.js';
import PrivateChatController from '../controllers/privateChatController.js';
import StatusController from '../controllers/statusController.js';
import userFactory from '../models/userModel.js';
import PrivateMessageFactory from '../models/privateMessageModel.js';
import ChatroomFactory from '../models/chatroomModel.js';
import { realConnection, testConnection } from '../services/db.js';

const router = express.Router();
// const userModel = userFactory(realConnection);
// const privateChatModel = PrivateMessageFactory(realConnection);
// const chatroomModel = ChatroomFactory(realConnection);
const userModel = userFactory(realConnection);
const testUserModel = userFactory(testConnection);
const testPrivateChatModel = PrivateMessageFactory(testConnection);
const testChatroomModel = ChatroomFactory(testConnection);
const privateChatModel = PrivateMessageFactory(realConnection);
const chatroomModel = ChatroomFactory(realConnection);
const userController = new UserController(userModel);
const loginController = new LoginController(userModel);
const statusController = new StatusController(userModel);
const privateChatController = new PrivateChatController(
  privateChatModel,
  chatroomModel,
  userModel,
);
const testPrivateChatController = new PrivateChatController(
  testPrivateChatModel,
  testChatroomModel,
  testUserModel,
);
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users, Search]
 *     summary: Get all users
 *     description: Get a list of all registered usernames and a list of banned usernames
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     users:
 *                       $ref: '#/components/schemas/UserList'
 *                       description: List of registered usernames
 *                     banned_users:
 *                       $ref: '#/components/schemas/UsernameList'
 *                       description: List of banned usernames
 *             example:
 *               message: OK
 *               users: [
 *                 {username: testUser1, isOnline: true},
 *                 {username: testUser2, isOnline: false}
 *               ]
 *               banned_users: [bannedUser1, bannedUser2]
 */
router.get('/', (req, res) => {
  // userController.getAllUsers(req, res);
  if (req.query.istest === 'true') {
    const testUserController = new UserController(testUserModel);
    testUserController.getAllUsers(req, res);
  } else {
    userController.getAllUsers(req, res);
  }
});

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by username
 *     description: Get a user by username
 *     parameters:
 *       - $ref: '#/parameters/username'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: Not a registered user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   message: User not found
 *               bannedUser:
 *                 value:
 *                   message: Banned username
 */
router.get('/:username', (req, res) => {
  // userController.getUserByUsername(req, res);
  if (req.query.istest === 'true') {
    const testUserController = new UserController(testUserModel);
    testUserController.getUserByUsername(req, res);
  } else {
    userController.getUserByUsername(req, res);
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Create a new user with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *              allOf:
 *                - $ref: '#/components/schemas/Response'
 *                - type: object
 *                  properties:
 *                    token:
 *                      $ref: '#/components/schemas/UserToken'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       405:
 *         description: Duplicated username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Duplicated username
 */
router.post('/', (req, res) => {
  // userController.createUser(req, res);
  // hahaha
  if (req.query.istest === 'true') {
    const testUserController = new UserController(testUserModel);
    testUserController.createUser(req, res);
  } else {
    userController.createUser(req, res);
  }
});

router.delete('/', (req, res) => {
  if (req.query.istest === 'true') {
    const testUserController = new UserController(testUserModel);
    testUserController.deleteUser(req, res);
  } else {
    userController.deleteUser(req, res);
  }
});

/**
 * @swagger
 * /users/{username}/online:
 *   put:
 *     tags: [Users]
 *     summary: login / switch to online status
 *     description: switch user to online status
 *     parameters:
 *       - $ref: '#/parameters/username'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 $ref: '#/components/schemas/UserPassword'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *              allOf:
 *                - $ref: '#/components/schemas/Response'
 *                - type: object
 *                  properties:
 *                    token:
 *                      $ref: '#/components/schemas/UserToken'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: Fail to login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Incorrect username/password
 */
router.put('/:username/online', (req, res) => {
  // loginController.updateOnlineStatus(req, res);
  if (req.query.istest === 'true') {
    const testLoginController = new LoginController(testUserModel);
    testLoginController.updateOnlineStatus(req, res);
  } else {
    loginController.updateOnlineStatus(req, res);
  }
});

router.post('/:username', (req, res) => {
  // loginController.loginUser(req, res);
  if (req.query.istest === 'true') {
    const testLoginController = new LoginController(testUserModel);
    testLoginController.loginUser(req, res);
  } else {
    loginController.loginUser(req, res);
  }
});

/**
 * @swagger
 * /users/{username}/offline:
 *   put:
 *     tags: [Users]
 *     summary: logout / switch to offline status
 *     description: logout a user
 *     parameters:
 *       - $ref: '#/parameters/username'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *              allOf:
 *                - $ref: '#/components/schemas/Response'
 *                - type: object
 *                  properties:
 *                    user:
 *                      $ref: '#/components/schemas/Username'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       405:
 *         description: Fail to logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.put('/:username/offline', (req, res) => {
  // loginController.logoutUser(req, res);
  if (req.query.istest === 'true') {
    const testLoginController = new LoginController(testUserModel);
    testLoginController.logoutUser(req, res);
  } else {
    loginController.logoutUser(req, res);
  }
});

/**
 * @swagger
 * /users/{username}/private:
 *   get:
 *     tags: [Users]
 *     summary: Get all users that have privately chatted before
 *     description: Get all users that have privately chatted before
 *     parameters:
 *       - $ref: '#/parameters/username'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                        $ref: '#/components/schemas/Username'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
// privateChatController.getAllPri

router.get('/:username/private', (req, res) => {
  if (req.query.istest === 'true') {
    testPrivateChatController.getAllPrivate(req, res);
  } else {
    privateChatController.getAllPrivate(req, res);
  }
});
/**
 * @swagger
 * /users/:username/status:
 *   get:
 *     tags: [Users]
 *     summary: Get one use's' status history.
 *     description: Get one use's' status history.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: array
 *                       items:
 *                        $ref: '#/components/schemas/StatusHistory'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/:username/status', (req, res) => {
  // if (req.query.istest === 'true') {
  //   const testStatusController = new StatusController(testUserModel);
  //   testStatusController.getStatus(req, res);
  // } else {
  //   statusController.getStatus(req, res);
  // }
  // statusController.getStatus(req, res);
  if (req.query.istest === 'true') {
    const testStatusController = new StatusController(testUserModel);
    testStatusController.getStatus(req, res);
  } else {
    statusController.getStatus(req, res);
  }
});

/**
 * @swagger
 * /users/{username}/status/{status}:
 *   post:
 *     tags: [Users]
 *     summary: Update user status
 *     description: Update user status
 *     parameters:
 *       - $ref: '#/parameters/username'
 *       - $ref: '#/parameters/status'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
  *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not found
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.post('/:username/status/:status', (req, res) => {
  if (req.query.istest === 'true') {
    const testStatusController = new StatusController(testUserModel);
    testStatusController.updateStatus(req, res);
  } else {
    statusController.updateStatus(req, res);
  }
});

// /**
//   * @swagger
//   * /users/validate:
//   *   post:
//   *     summary: validate new user information
//   *     description: validate the username and password input from a new user
//   *     tags: [obsolete]
//   *     requestBody:
//   *       required: true
//   *       content:
//   *         application/json:
//   *           schema:
//   *             $ref: '#/components/schemas/NewUser'
//   *     responses:
//   *       200:
//   *         description: validation success
//   *         schema:
//   *           type: object
//   *           $ref: '#/components/schemas/NewUser'
// */
// router.post('/validate', UserController.validate);

// /**
//   * @swagger
//   * /users/register:
//   *   post:
//   *     summary: register a new user
//   *     description: Store new user's username and password into database
//   *     tags: [obsolete]
//   *     requestBody:
//   *       required: true
//   *       content:
//   *         application/json:
//   *           schema:
//   *             $ref: '#/components/schemas/NewUser'
//   *     responses:
//   *       200:
//   *         description: registration success
//   *         schema:
//   *           type: object
//   *           $ref: '#/components/schemas/NewUser'
// */
// router.post('/register', UserController.createUser);

export default router;
