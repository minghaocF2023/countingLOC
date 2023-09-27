/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: User's username
 *           example: testUser
 *         password:
 *           type: string
 *           description: User's password
 *           example: testPassword
 *     Response:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Response message
 */
const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Get a list of all registered usernames and a list of banned usernames
 */
router.get('/', UserController.getAllUsers);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by username
 *     description: Get a user by username
 */
router.get('/:username', UserController.getUserByUsername);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Create a new user with username and password
 */
router.post('/', UserController.createUser);

/**
 * @swagger
 * /api/users/{username}/online:
 *   put:
 *     tags: [Users]
 *     summary: login
 *     description: login a user with password
 */
router.put('/:username/online', UserController.loginUser);

/**
 * @swagger
 * /api/users/{username}/offline:
 *   put:
 *     tags: [Users]
 *     summary: logout
 *     description: logout a user
 */
router.put('/:username/offline', UserController.logoutUser);

/**
  * @swagger
  * /api/users/validate:
  *   post:
  *     summary: validate new user information
  *     description: validate the username and password input from a new user
  *     tags: [obsolete]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/User'
  *     responses:
  *       200:
  *         description: validation success
  *         schema:
  *           type: object
  *           $ref: '#/components/schemas/User'
*/
router.post('/validate', UserController.validate);

/**
  * @swagger
  * /api/users/register:
  *   post:
  *     summary: register a new user
  *     description: Store new user's username and password into database
  *     tags: [obsolete]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/User'
  *     responses:
  *       200:
  *         description: registration success
  *         schema:
  *           type: object
  *           $ref: '#/components/schemas/User'
*/
router.post('/register', UserController.createUser);

module.exports = router;
