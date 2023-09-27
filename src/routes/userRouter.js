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
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         username: testUser
 *         password: userpassword
 */

const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

router.get('/', UserController.getAllUsers);
router.get('/:username', UserController.getUserByUsername);
router.post('/', UserController.createUser);
router.put('/:username/online', UserController.loginUser);
router.put('/:username/offline', UserController.logoutUser);

/**
  * @swagger
  * /api/users/validate:
  *   post:
  *     description: validate user
  *     tags: [Users]
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
  *     description:
  *     tags: [Users]
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
