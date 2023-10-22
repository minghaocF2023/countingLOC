/**
 * @swagger
 * components:
 *   schemas:
 *     user:
 *       type: string
 *       description: user's username
 *       example: username
 *     NewMessage:
 *       type: object
 *       description: New message
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Message content
 *           example: Hello World!
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
 *     Message:
 *       allOf:
 *         - $ref: '#/components/schemas/NewMessage'
 *         - type: object
 *           properties:
 *             senderName:
 *               $ref: '#/components/schemas/Username'
 *               description: Message author
 *             status:
 *               type: string
 *               description: Message status
 *               example: GREEN
 *             timestamp:
 *               type: string
 *               description: Message creation time
 *               example: 1970-01-01 00:00:00
 *     PrivateMessageList:
 *       allOf:
 *         - $ref: '#/components/schemas/PrivateMessage'
 *         - type: object
 *           properties:
 *             senderName:
 *               $ref: '#/components/schemas/Username'
 *               description: Message author
 *             receiverName:
 *               $ref: '#/components/schemas/Username'
 *               description: Message receiver
 *             status:
 *               type: string
 *               description: Message status
 *               example: OK
 *             timestamp:
 *               type: string
 *               description: Message creation time
 *               example: 1970-01-01 00:00:00
 */

/**
 * @swagger
 * parameters:
 *   userA:
 *     name: userA
 *     in: path
 *     description: Username of a userA
 *     required: true
 *     schema:
 *       type: string
 *     example: userA
 *   userB:
 *     name: userB
 *     in: path
 *     description: Username of a userB
 *     required: true
 *     schema:
 *       type: string
 *     example: userB
 *   receiver:
 *     name: receiver
 *     in: path
 *     description: Username of a receiver
 *     required: true
 *     schema:
 *       type: string
 *     example: receiveuser
 *   isInChat:
 *     name: isInChat
 *     in: query
 *     description: if user is in chat
 *     required: true
 *     schema:
 *       type: boolean
 *     example: true
 */
import express from 'express';
import PublicChatController from '../controllers/publicChatController.js';
import PrivateChatController from '../controllers/privateChatController.js';
import PublicMessageFactory from '../models/publicMessageModel.js';
import PrivateMessageFactory from '../models/privateMessageModel.js';
import UserFactory from '../models/userModel.js';
import ChatroomFactory from '../models/chatroomModel.js';
import { realConnection } from '../services/db.js';

const router = express.Router();
const userModel = UserFactory(realConnection);
const publicMessageModel = PublicMessageFactory(realConnection);
const privateMessageModel = PrivateMessageFactory(realConnection);
const chatroomModel = ChatroomFactory(realConnection);

const publicChatController = new PublicChatController(publicMessageModel, userModel);
const privateChatController = new PrivateChatController(
  privateMessageModel,
  chatroomModel,
  userModel,
);

/**
 * @swagger
 * /messages/public:
 *   get:
 *     tags: [Messages]
 *     summary: Get all public messages
 *     description: Get all messages published on the public wall
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
 *                     messages:
 *                       type: array
 *                       items:
 *                        $ref: '#/components/schemas/Message'
 */
// router.get('/public', PublicChatController.getLatestMessages);
router.get('/public', (req, res) => {
  publicChatController.getLatestMessages(req, res);
});

// /**
//  * @swagger
//  * /messages/public/{username}:
//  *   get:
//  *     tags: [Messages]
//  *     summary: Get all public messages sent by a user
//  *     description: Get all messages published on the public wall by a user
//  */
// router.get('/public/:username', MessageController.getPublicMessageByUsername);

/**
 * @swagger
 * /messages/public:
 *   post:
 *     tags: [Messages]
 *     summary: Post a new public message
 *     description: Post a new message on the public wall
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMessage'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                       description: Message ID
 *                       example: 650b635c9d39c281eac33bbf
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
// router.post('/public', PublicChatController.postNew);
router.post('/public', (req, res) => {
  publicChatController.postNew(req, res);
});

/**
 * @swagger
 * /messages/private:
 *   post:
 *     tags: [Messages]
 *     summary: Post a new private message
 *     description: Post a new message on the private wall
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivateMessage'
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - type: object
 *                   properties:
 *                     mid:
 *                       type: string
 *                       description: Message ID
 *                       example: 650b635c9d39c281eac33bbf
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
// router.post('/private', privateChatController.postNewPrivate);
router.post('/private', (req, res) => {
  privateChatController.postNewPrivate(req, res);
});

/**
 * @swagger
 * /messages/private/{userA}/{userB}:
 *   get:
 *     tags: [Messages]
 *     summary: Get all private messages between sender and receiver
 *     description: Get all messages published on the public wall
 *     parameters:
 *       - $ref: '#/parameters/userA'
 *       - $ref: '#/parameters/userB'
 *       - $ref: '#/parameters/isInChat'
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
 *                     messages:
 *                       type: array
 *                       items:
 *                        $ref: '#/components/schemas/PrivateMessageList'
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
// router.get('/private/:userA/:userB', privateChatController.getLatestMessageBetweenUsers);
router.get('/private/:userA/:userB', (req, res) => {
  privateChatController.getLatestMessageBetweenUsers(req, res);
});

export default router;
