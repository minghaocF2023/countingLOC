/**
 * @swagger
 * components:
 *   schemas:
 *     Username:
 *       type: string
 *       description: User's username
 *       example: testUser
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
 */

import express from 'express';
import UserController from '../controllers/userController.js';
import LoginController from '../controllers/loginController.js';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
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
router.get('/', UserController.getAllUsers);

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
router.get('/:username', UserController.getUserByUsername);

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
router.post('/', UserController.createUser);

/**
 * @swagger
 * /users/{username}/online:
 *   put:
 *     tags: [Users]
 *     summary: login
 *     description: login a user with password
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
router.put('/:username/online', LoginController.loginUser);

/**
 * @swagger
 * /users/{username}/offline:
 *   put:
 *     tags: [Users]
 *     summary: logout
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
router.put('/:username/offline', LoginController.logoutUser);

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
