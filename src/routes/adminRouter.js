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
 *         function:
 *           type: string
 *           description: API name
 *           example: /messages/private
 *         type:
 *           type: string
 *           description: API type
 *           example: post
 *         reqData:
 *           type: object
 *           description: optional request data for testing
 *           $ref: '#/components/schemas/PrivateMessage'
 *         duration:
 *           type: int
 *           description: test duration (ms)
 *           example: 1000
 */
import express from 'express';
import { startSpeedTest, getIsTestState } from '../controllers/speedTestController.js';

const router = express.Router();

/**
 * @swagger
 * /admin/speedtest:
 *   post:
 *     tags: [Admin]
 *     summary: start testing, suspend the system operations except the test API
 *     description: get the speed test report of each functions
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
router.get('/speedtest', (req, res) => {
  res.status(501).json({ message: 'Not implemented.' });
});

/**
 * @swagger
 * /admin/speedtest:
 *   get:
 *     tags: [Admin]
 *     summary: get test report
 *     description: get the speed test report of each functions
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
 *                      report:
 *                         type: object
 *                         $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Response'
 *             example:
 *               message: Invalid request
 *       403:
 *         description: User unauthorized
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
  res.status(501).json({ message: 'Not implemented.' });
});

router.post('/startspeedtest', startSpeedTest);
router.get('/istest', getIsTestState);
export default router;
