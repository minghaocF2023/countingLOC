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

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/acknowledge', (req, res) => {
  res.render('acknowledge');
});

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
router.post('/api/users/validate', UserController.validate);

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
router.post('/api/users/register', UserController.registerUser);

module.exports = router;
