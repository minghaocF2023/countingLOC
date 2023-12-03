/* eslint-disable new-cap */
/**
 * @swagger
 * components:
 *   schemas:
 *     Username:
 *       type: string
 *       description: User's username
 *       example: testUser
 *     Allergy:
 *       type: string
 *       description: Allergy
 *       example: ibuprofen
 *     Health:
 *       type: string
 *       description: Health condition
 *       example: Lung Cancer
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
 *     Profile:
 *       type: object
 *       description: user profile
 *       properties:
 *         firstName:
 *           type: string
 *           description: first name
 *           example: Leo
 *         lastName:
 *           type: string
 *           description: last name
 *           example: Bot
 *         pronoun:
 *           type: string
 *           description: last name
 *           example: Bot
 *         profileImage:
 *           type: string
 *           description: profile image url
 *           example: https://cdn.custom-cursor.com/cursors/pack2195.png
 *         birthdate:
 *           type: string
 *           description: user birthdate
 *           example: 01/01/2023
 *         phone:
 *           type: string
 *           description: user phone number
 *           example: 6500000000
 *         email:
 *           type: string
 *           description: user email
 *           example: leobot@andrew.cmu.edu
 *         doctorEmail:
 *           type: string
 *           description: doctoremail
 *           example: drleo@andrew.cmu.edu
 *         drugAllergy:
 *           type: array
 *           description: drug allergy list
 *           items:
 *             $ref: '#/components/schemas/Allergy'
 *         healthCondition:
 *           type: array
 *           description: health condition list
 *           items:
 *             $ref: '#/components/schemas/Health'
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
 *     UserStatus:
 *       type: string
 *       example: "Help"
 *     User:
 *       type: object
 *       description: User entries for frontend
 *       properties:
 *         username:
 *           $ref: '#/components/schemas/Username'
 *         isOnline:
 *           $ref: '#/components/schemas/UserOnlineStatus'
 *         status:
 *           $ref: '#/components/schemas/UserStatus'
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
import ProfileController from '../controllers/profileController.js';
import {
  userModel,
  testUserModel,
  ProfileModel,
  testProfileModel,

} from '../models/models.js';
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

const router = express.Router();
const profile = new ProfileModel();
// eslint-disable-next-line new-cap
const profileController = new ProfileController(new userModel(), profile);
const testProfileController = new ProfileController(new testUserModel(), new testProfileModel());

router.use((req, res, next) => {
  const payload = authChecker.checkAuth(req, res);
  if (!payload) {
    next('router');
  } else if (testChecker.isTest(res, payload)) {
    next('router');
  } else {
    next();
  }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: view your user profile
 *     description: view your user profile
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
 *                    profile:
 *                      $ref: '#/components/schemas/Profile'
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
router.get('/', (req, res) => {
  if (req.query.istest === 'true') {
    testProfileController.getProfile(req, res);
  } else {
    profileController.getProfile(req, res);
  }
});

/**
   * @swagger
   * /users/profile/{username}:
   *   get:
   *     tags: [Profile]
   *     summary: view someone's profile
   *     description: view someone's user profile
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
   *                    profile:
   *                      $ref: '#/components/schemas/Profile'
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
router.get('/:username', (req, res) => {
  if (req.query.istest === 'true') {
    testProfileController.getContactProfile(req, res);
  } else {
    profileController.getContactProfile(req, res);
  }
});

/**
   * @swagger
   * /profile:
   *   post:
   *     tags: [Profile]
   *     summary: create user profile
   *     description: create current logged in user's user profile
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *               allOf:
   *                 - type: object
   *                   properties:
   *                    profile:
   *                      $ref: '#/components/schemas/Profile'
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
   *                    profile:
   *                      $ref: '#/components/schemas/Profile'
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
router.post('/', (req, res) => {
  if (req.query.istest === 'true') {
    testProfileController.postProfile(req, res);
  } else {
    profileController.postProfile(req, res);
  }
});

/**
   * @swagger
   * /profile:
   *   put:
   *     tags: [Profile]
   *     summary: update user profile
   *     description: update current logged in user's user profile
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *             schema:
   *               allOf:
   *                 - type: object
   *                   properties:
   *                    profile:
   *                      $ref: '#/components/schemas/Profile'
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
   *                    profile:
   *                      $ref: '#/components/schemas/Profile'
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
router.put('/', (req, res) => {
  if (req.query.istest === 'true') {
    testProfileController.updateProfile(req, res);
  } else {
    profileController.updateProfile(req, res);
  }
});

/**
   * @swagger
   * /profile:
   *   delete:
   *     tags: [Profile]
   *     summary: delete user profile
   *     description: delete current logged in user's user profile
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
router.delete('/', (req, res) => {
  if (req.query.istestt === 'true') {
    testProfileController.deleteProfile(req, res);
  } else {
    profileController.deleteProfile(req, res);
  }
});

router.delete('/all', (req, res) => {
  if (req.query.istest === 'true') {
    testProfileController.deleteAllProfiles(req, res);
  } else {
    console.log("don't call this");
  }
});
export default router;
