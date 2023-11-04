import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

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
    const payload = authChecker(req, res);
    if (!payload) {
      console.error('authorization error');
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort messages by timestamp
    const messages = await this.publicChatModel.find({}).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  // post new messages
  async postNew(req, res) {
    const payload = authChecker(req, res);
    if (!payload) {
      console.error('authorization error');
      return;
    }

    if (testChecker.isTest(res, payload)) {
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
    // random comment
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
