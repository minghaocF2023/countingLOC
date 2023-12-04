/* eslint-disable no-underscore-dangle */
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

/**
 * @typedef {{
 *  sender: Object,
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
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort messages by timestamp
    const messages = await this.publicChatModel.find({}).populate('sender').sort({ timeStamp: -1 });
    const filteredPublicMessages = messages.filter(
      (message) => message.sender.isActive,
    );
    res.status(200).json({
      success: true,
      data: filteredPublicMessages.map((m) => ({
        ...m.toObject(),
        senderName: m.sender.username,
      })),
    });
  }

  // post new messages
  async postNew(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
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
    const sender = await this.userModel.getOne({ username: payload.username });
    const data = {
      content,
      sender: sender._id,
      timestamp: Date.now(),
      status: sender.status,
    };
    // random comment
    // const newMessage = new PublicMessage(data);
    // eslint-disable-next-line new-cap
    const newMessage = new this.publicChatModel(data);
    await newMessage.save();

    const socketServer = req.app.get('socketServer');
    let message = await newMessage.populate('sender');
    message = {
      ...message.toObject(),
      senderName: message.sender.username,
    };
    socketServer.publishEvent('newMessage', message);

    res.status(201).json({ success: true, data: message });
  }
}
export default publicChatController;
