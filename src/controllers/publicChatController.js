import { PublicMessage, User } from '../models/models.js';
import JWT from '../utils/jwt.js';

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
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      res.status(401).json({ message: 'User not logged in' });
      return;
    }
    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      res.status(401);
      res.json({ message: 'User not logged in' });
      return;
    }
    // sort messages by timestamp
    const messages = await PublicMessage.find().sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  // post new messages
  static async postNew(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      res.status(401).json({ message: 'User not logged in' });
      return;
    }

    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      res.status(401);
      res.json({ message: 'User not logged in' });
      return;
    }
    if (!req.body.content) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const { content } = req.body;
    const data = {
      content,
      senderName: payload.username,
      timestamp: Date.now(),
      status: (await User.getOne({ username: payload.username })).status,
    };
    const newMessage = new PublicMessage(data);
    await newMessage.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newMessage', newMessage);

    res.status(201).json({ success: true, data: newMessage });
  }
}
export default publicChatController;
