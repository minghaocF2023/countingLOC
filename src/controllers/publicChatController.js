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
  // constructor
  constructor(publicChatModel, userModel) {
    this.publicChatModel = publicChatModel;
    this.userModel = userModel;
  }

  /**
   * Get all history messages
   */
  async getLatestMessages(req, res) {
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

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return;
    }
    // sort messages by timestamp
    // const messages = await PublicMessage.find().sort({ timeStamp: -1 });
    // const messages = this.publicChatModel.find().sort({ timeStamp: -1 });
    const messages = await this.publicChatModel.find({}).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  // post new messages
  async postNew(req, res) {
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

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
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
      status: (await this.userModel.getOne({ username: payload.username })).status,
    };
    // const newMessage = new PublicMessage(data);
    // eslint-disable-next-line new-cap
    const newMessage = new this.publicChatModel(data);
    await newMessage.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newMessage', newMessage);

    res.status(201).json({ success: true, data: newMessage });
  }
}
export default publicChatController;
