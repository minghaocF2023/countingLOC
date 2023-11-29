/**
 * @swagger
 * components:
 *   schemas:
*     ProfileElements:
 *       type: object
 *       description: user profile element
 *       properties:
 *        accountStatus:
 *          type: string
 *          description: account status
 *          example: Active
 *        privilegeLevel:
 *          type: string
 *          description: user's privilege level
 *          example: Administrator
 *        username:
 *          type: string
 *          description: username
 *          example: ESNAdmin
 *     ProfileReq:
 *       type: object
 *       description: user profile update request
 *       properties:
 *        accountStatus:
 *          type: string
 *          description: account status
 *          example: Active
 *        privilegeLevel:
 *          type: string
 *          description: user's privilege level
 *          example: Administrator
 *        username:
 *          type: string
 *          description: username
 *          example: ESNAdmin
 *        password:
 *          type: string
 *          description: password
 *          example: admin
 *     Report:
 *       type: object
 *       description: speed test report
 *       properties:
 *         function:
 *           type: string
 *           description: API name
 *           example: /messages/private
 *         type:
 *           type: string
 *           description: API type
 *           example: post
 *         apiCall:
 *           type: int
 *           description: total api call in a timeslice
 *           example: 100
 *         duration:
 *           type: int
 *           description: test duration (ms)
 *           example: 1000
 *     PrivateMessage:
 *       type: object
 *       description: New private message
 *       required:
 *         - content
 *       properties:
 *         receiverName:
 *           type: string
 *           description: Receiver Name
 *           example: Reciever
 *         content:
 *           type: string
 *           description: Message content
 *           example: Hello World!
 *     SpeedTestReq:
 *       type: object
 *       description: speed test request
 *       properties:
 *         duration:
 *           type: int
 *           description: test duration (ms)
 *           example: 10000
 *         interval:
 *           type: int
 *           description: test duration (ms)
 *           example: 1000
 */

/**
 * @swagger
 * parameters:
 *   username:
 *     name: username
 *     in: path
 *     description: username
 *     required: true
 *     schema:
 *       type: string
 *     example: randomuser
 */
import express from 'express';
import SpeedTestController from '../controllers/speedTestController.js';
import { testChatroomModel, testPublicMessageModel } from '../models/models.js';

const speedTestController = new SpeedTestController(testPublicMessageModel);
const router = express.Router();

/**
 * @swagger
 * /admin/stopspeedtest:
 *   post:
 *     tags: [Admin]
 *     summary: suspend system, and start performance test
 *     description: call a api for {duration} and with {interval} between every api call,
 *      will broadcast {startspeedtest} & {finishspeedtest} socket when test begin and finish
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
 *                     message:
 *                       type: string
 *                       desciption: test result message
 *                       example: set istest to false
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       403:
 *         description: User Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User unauthorized
 *       401:
 *         description:  in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.post('/stopspeedtest', (req, res) => {
  speedTestController.stopSpeedTest(req, res);
});

/**
 * @swagger
 * /admin/startspeedtest:
 *   post:
 *     tags: [Admin]
 *     summary: suspend system, and start performance test
 *     description: call a api for {duration} and with {interval} between every api call,
 *      will broadcast {startspeedtest} & {finishspeedtest} socket when test begin and finish
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
 *                     message:
 *                       type: string
 *                       desciption: test result message
 *                       example: set speedtest to true
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       403:
 *         description: User Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User unauthorized
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.post('/startspeedtest', (req, res) => {
  speedTestController.startSpeedTest(req, res);
});
router.get('/istest', (req, res) => {
  speedTestController.getIsTestState(req, res);
});

/**
 * @swagger
 * /admin/profile/{username}:
 *   put:
 *     tags: [Admin]
 *     summary: update a user's profile elements
 *     description: call a api for {duration} and with {interval} between every api call,
 *      will broadcast {startspeedtest} & {finishspeedtest} socket when test begin and finish
 *     parameters:
 *       - $ref: '#/parameters/username'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileReq'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       403:
 *         description: User Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User unauthorized
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.get('/profile/:username', (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

/**
 * @swagger
 * /admin/profile/{username}:
 *   get:
 *     tags: [Admin]
 *     summary: update a user's profile elements
 *     description: call a api for {duration} and with {interval} between every api call,
 *      will broadcast {startspeedtest} & {finishspeedtest} socket when test begin and finish
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
 *                      $ref: '#/components/schemas/ProfileElements'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       403:
 *         description: User Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User unauthorized
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: User not logged in
 */
router.put('/profile/:username', (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
});

router.delete('/chatroom', (req, res) => {
  if (req.query.istest === 'true') {
    testChatroomModel.findOneAndRemove({
      senderName: req.body.senderName,
      receiverName: req.body.receiverName,
    }).then(() => {
      res.status(200).json({ message: 'delete successful' });
    });
  }
});
export default router;
