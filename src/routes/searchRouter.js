import express from 'express';
import SearchController from '../controllers/searchController.js';
import userFactory from '../models/userModel.js';
import PublicMessageFactory from '../models/publicMessageModel.js';
import PrivateMessageFactory from '../models/privateMessageModel.js';
import ChatroomFactory from '../models/chatroomModel.js';
import AnnouncementFactory from '../models/announcementModel.js';
import { realConnection, testConnection } from '../services/db.js';

const router = express.Router();

const userModel = userFactory(realConnection);
const testUserModel = userFactory(testConnection);
const publicChatModel = PublicMessageFactory(realConnection);
const testPublicChatModel = PublicMessageFactory(testConnection);
const privateChatModel = PrivateMessageFactory(realConnection);
const testPrivateChatModel = PrivateMessageFactory(testConnection);
const chatroomModel = ChatroomFactory(realConnection);
const testChatroomModel = ChatroomFactory(testConnection);
const announcementModel = AnnouncementFactory(realConnection);
const testAnnouncementModel = AnnouncementFactory(testConnection);

const searchController = new SearchController(
  userModel,
  publicChatModel,
  privateChatModel,
  chatroomModel,
  announcementModel,
);
const testSearchController = new SearchController(
  testUserModel,
  testPublicChatModel,
  testPrivateChatModel,
  testChatroomModel,
  testAnnouncementModel,
);

/**
 * @swagger
 * /search:
 *   get:
 *     tags: [Search]
 *     summary: Search for users, public/private chats, and announcements
 *     description: Search for users, public/private chats, and announcements
 *     parameters:
 *       - in: query
 *         name: context
 *         description: The scope of the search
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, public, private, announcement]
 *         example: user
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: number
 *         default: 10
 *         example: 10
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: number
 *         default: 1
 *         example: 1
 *       - in: query
 *         name: username
 *         description: Search users with the given (partial) username
 *         schema:
 *           type: string
 *         example: Jerry
 *       - in: query
 *         name: status
 *         description: Search users with the given status (case insensitive)
 *         schema:
 *           type: string
 *           enum: [OK, Help, Emergency]
 *         example: Help
 *       - in: query
 *         name: words
 *         schema:
 *           type: string
 *         example: hello world
 *       - in: query
 *         name: userA
 *         schema:
 *           type: string
 *         example: Leo
 *       - in: query
 *         name: userB
 *         schema:
 *           type: string
 *         example: Jerry
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Response'
 *                 - oneOf:
 *                   - type: object
 *                     properties:
 *                       users:
 *                         $ref: '#/components/schemas/UserList'
 *                   - type: object
 *                     properties:
 *                       public:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Message'
 *                   - type: object
 *                     properties:
 *                       private:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/PrivateMessage'
 *                   - type: object
 *                     properties:
 *                       private:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/StatusHistory'
 */
router.get('/', (req, res) => {
  if (req.query.istest === 'true') {
    // console.log("======");
    testSearchController.search(req, res);
  } else {
    searchController.search(req, res);
  }
});

export default router;
