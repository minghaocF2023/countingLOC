import express from 'express';
import MessageController from '../controllers/messageController.js';

const router = express.Router();

/**
 * @swagger
 * /api/messages/public:
 *   get:
 *     tags: [Messages]
 *     summary: Get all public messages
 *     description: Get all messages published on the public wall
 */
router.get('/public', MessageController.getAllPublicMessages);

/**
 * @swagger
 * /api/messages/public/{username}:
 *   get:
 *     tags: [Messages]
 *     summary: Get all public messages sent by a user
 *     description: Get all messages published on the public wall by a user
 */
router.get('/public/:username', MessageController.getPublicMessageByUsername);

/**
 * @swagger
 * /api/messages/public:
 *   post:
 *     tags: [Messages]
 *     summary: Post a new public message
 *     description: Post a new message on the public wall
 */
router.post('/public', MessageController.createPublicMessage);

export default router;
