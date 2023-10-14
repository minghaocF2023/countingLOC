import { PrivateMessage, User } from '../models/models.js';
import JWT from '../utils/jwt.js';

class privateChatController {
  // eslint-disable-next-line consistent-return
  static async getLatestMessageBetweenUsers(req, res) {
    // get all messages between userA and userB
    const { userA, userB } = req.params;

    if (!userA || !userB) {
      return res.status(400).json({ message: 'Both userA and userB are required' });
    }

    const query = {
      $or: [
        { senderName: userA, receiverName: userB },
        { senderName: userB, receiverName: userA },
      ],
    };

    PrivateMessage.get(query).then((privateMessages) => {
      const resData = [];
      // organize response data
      privateMessages.forEach((pm) => {
        const element = {
          content: pm.getText,
          senderName: pm.getSenderName,
          receiverName: pm.getReceiverName,
          status: pm.getStatus,
          timestamp: pm.getTimestamp,
        };
        resData.push(element);
      });
      // success
      res.status(200).json({ message: 'OK', data: resData });
    }).catch(() => res.status(500).json({ message: 'Database error' }));
    // error
  }

  static async postNewPrivate(req, res) {
    const { content, receiverName } = req.body;
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      res.status(401).json({ message: 'User not logged in' });
      return;
    }

    const payload = JWT.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      res.status(401);
      res.json({ message: 'User not logged in' });
      return;
    }

    const data = {
      content,
      senderName: payload.username,
      receiverName,
      timestamp: Date.now(),
      status: 'OK',
    };
    const newPrivateMessage = new PrivateMessage(data);
    await newPrivateMessage.save();

    // const socketServer = req.app.get('socketServer');
    // socketServer.publishEvent('newPrivateMessage', newPrivateMessage);

    res.status(201).json({ success: true, data: newPrivateMessage });
  }

  static async getAllPrivate(req, res) {
    // for private wall
    // get list of users who have chatted before
    res.status(501).json({ message: 'Not implemented' });
  }
}
export default privateChatController;
