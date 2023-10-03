/**
 * @swagger
 * components:
 *   schemas:
 *     NewMessage:
 *       type: object
 *       description: New message
 *       required:
 *         - author
 *         - content
 *       properties:
 *         author:
 *           $ref: '#/components/schemas/Username'
 *           description: Message author
 *         content:
 *           type: string
 *           description: Message content
 *           example: Hello World!
 *     Message:
 *       allOf:
 *         - $ref: '#/components/schemas/NewMessage'
 *         - type: object
 *           properties:
 *             mid:
 *               type: string
 *               description: Message ID
 *               example: 650b635c9d39c281eac33bbf
 *             status:
 *               type: string
 *               description: Message status
 *               example: OK
 *             createdAt:
 *               type: string
 *               description: Message creation time
 *               example: 1970-01-01 00:00:00
 */

import express from 'express';
import PublicChatController from '../controllers/publicChatController.js';

const router = express.Router();

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
router.get('/public', PublicChatController.getLatestMessages);

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
 */
router.post('/public', PublicChatController.postNew);

export default router;
