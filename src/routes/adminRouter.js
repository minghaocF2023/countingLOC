/**
 * @swagger
 * components:
 *   schemas:
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
import express from 'express';
import SpeedTestController from '../controllers/speedTestController.js';
import { testConnection } from '../services/db.js';
import PublicMessageFactory from '../models/publicMessageModel.js';

const testPublicChatModel = PublicMessageFactory(testConnection);
const speedTestController = new SpeedTestController(testPublicChatModel);
const router = express.Router();

/**
 * @swagger
 * /admin/speedtest:
 *   post:
 *     tags: [Admin]
 *     summary: suspend system, and start performance test
 *     description: call a api for {duration} and with {interval} between every api call,
 *      will broadcast {startspeedtest} & {finishspeedtest} socket when test begin and finish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpeedTestReq'
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
 *                       example: test finish
 *                     POSTs:
 *                       type: int
 *                       description: number of post api finished
 *                       example: 4
 *                     GETs:
 *                       type: int
 *                       description: number of post api finished
 *                       example: 6
 *                     errors:
 *                       type: array
 *                       description: error lists that the test apis reported
 *
 *
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
router.post('/speedtest', (req, res) => {
  speedTestController.startSpeedTest(req, res);
});

router.post('/startspeedtest', (req, res) => {
  speedTestController.startSpeedTest(req, res);
});
router.get('/istest', (req, res) => {
  speedTestController.getIsTestState(req, res);
});
export default router;
