import jwt from 'jsonwebtoken';
import PublicMessage from '../models/messageModel.js';

const TOKEN_SECRET = 'Some secret keys';

/**
 * Validate JWT token
 * @param {string} token JWT token
 */
const validateToken = (token) => {
  jwt.verify(token, TOKEN_SECRET);
};

/**
 * @typedef {{
 *  senderName: string,
 *  content: string,
 *  status: string,
 *  timestamp: string
 * }} Message
 */

class publicChatController {
  /**
   * Get all history messages
   */
  static async getLatestMessages(req, res) {
    if (!req.headers.authorization) {
      res.status(403).json({ message: 'Empty token' });
    }

    validateToken(req.headers.authorization.split(' ')[1]);
    // sort messages by timestamp
    const messages = await PublicMessage.find().sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  // post new messages
  static async postNew(req, res) {
    validateToken(req.headers.authorization);

    if (!req.params.text) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const {
      content, senderName, timestamp, status,
    } = req.body;
    const newMessage = new PublicMessage(content, senderName, timestamp, status);
    await newMessage.save();

    // io.emit('newMessage', newMessage);
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newMessage', newMessage);

    res.status(201).json({ success: true, data: newMessage });
  }
}
export default publicChatController;
