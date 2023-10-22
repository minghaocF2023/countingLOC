import { Chatroom, PrivateMessage, User } from '../models/models.js';
import JWT from '../utils/jwt.js';
import 'dotenv/config';

class privateChatController {
  static async getLatestMessageBetweenUsers(req, res) {
    // get all messages between userA and userB
    const { userA, userB } = req.params;
    const isInChat = req.query.isInChat === 'true';
    // hardcode
    // const { isInChat } = req.body;
    if (!userA || !userB) {
      res.status(400).json({ message: 'Both userA and userB are required' });
    }

    const query = {
      $or: [
        { senderName: userA, receiverName: userB },
        { senderName: userB, receiverName: userA },
      ],
    };
    // assume userB = receiver
    let anyMessageUnread = false;
    const messageToBeViewed = [];
    PrivateMessage.get(query).then((privateMessages) => {
      const resData = [];
      // organize response data
      privateMessages.forEach(async (pm) => {
        const element = {
          chatroomId: pm.getChatroomID(),
          content: pm.getText(),
          senderName: pm.getSenderName(),
          receiverName: pm.getReceiverName(),
          status: pm.getStatus(),
          timestamp: pm.getTimestamp(),
          isViewed: pm.getIsViewed(),
        };
        if (isInChat && element.isViewed === false && element.receiverName === userB) {
          // eslint-disable-next-line no-underscore-dangle
          messageToBeViewed.push(pm._id);
          element.isViewed = true;
        }
        resData.push(element);

        // if already in private chatroom, and if any message is not viewed, update as viewed

        // if any messages is not viewed yet, set anyMessageUnread as true
        if (element.receiverName === userB && element.isViewed === false) {
          anyMessageUnread = true;
        }
      });
      const changeToViewedTaskList = [];
      messageToBeViewed.forEach((messageId) => {
        const task = new Promise((resolve) => {
          PrivateMessage.markedAsViewed(messageId).then(() => {
            resolve();
          });
        });
        changeToViewedTaskList.push(task);
      });

      Promise.all(changeToViewedTaskList).then(() => {
        // if user is not in chatroom, messageUnread = false
        const response = { message: 'OK', data: resData, messageUnread: false };

        if (!isInChat) {
          if (anyMessageUnread) {
            response.messageUnread = true;
          }
        }

        // success
        res.status(200).json(response);
      }).catch(() => res.status(500).json({ message: 'Database error' }));
    });
  }

  /**
   * send a new private message
   */
  static async postNewPrivate(req, res) {
    const { content, receiverName } = req.body;
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

    // search the chatroom belongs to the sender and receiver
    const senderName = payload.username;
    const query = {
      $or: [
        { senderName, receiverName },
        { senderName: receiverName, receiverName: senderName },
      ],
    };
    Chatroom.getOne(query).then(async (chatroom) => {
      // if not found, create a new chatroom
      let targetChatroom = chatroom;
      if (!targetChatroom) {
        const newChatroom = new Chatroom({
          senderName,
          receiverName,
        });
        await newChatroom.save();
        const userQuery = {
          $or: [
            { username: senderName },
            { username: receiverName },
          ],
        };
        User.get(userQuery).then((users) => {
          users.forEach(async (user) => {
            const userId = user.getUserId();
            const chatrooms = user.getChatrooms();
            chatrooms.push(newChatroom.getChatroomId());
            User.updateDoc({ _id: userId }, { chatrooms });
          });
        });
        targetChatroom = newChatroom;
      }

      const data = {
        chatroomId: targetChatroom.getChatroomId(),
        content,
        senderName: payload.username,
        receiverName,
        timestamp: Date.now(),
        status: 'OK',
        isViewed: false,
      };
      const newPrivateMessage = new PrivateMessage(data);
      await newPrivateMessage.save();

      // broadcast to receiver
      const socketServer = req.app.get('socketServer');
      socketServer.sendToPrivate('privatemessage', receiverName, data.content);

      res.status(201).json({ success: true, data: newPrivateMessage });
    });
  }

  /**
   * get all private users that have chatted with ME
   */
  static async getAllPrivate(req, res) {
    // for private wall
    // get list of users who have chatted before
    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      res.status(401);
      res.json({ message: 'User not logged in' });
      return;
    }
    const { username } = payload;
    // user -> getChatroom -> another user -> append to result array
    const userQuery = { username };
    // eslint-disable-next-line prefer-const

    User.getOne(userQuery).then(async (user) => {
      const chatrooms = user.getChatrooms();
      // eslint-disable-next-line prefer-const
      const otherUsers = [];
      const taskList = [];
      chatrooms.forEach((chatroomId) => {
        const task = new Promise((resolve) => {
          Chatroom.findById(chatroomId).then(async (chatroom) => {
            if (chatroom) {
              const otherUser = chatroom.senderName
              === username ? chatroom.receiverName : chatroom.senderName;
              if (!otherUsers.includes(otherUser)) {
                otherUsers.push(otherUser);
              }
              resolve();
            }
          });
        });
        taskList.push(task);
      });

      Promise.all(taskList).then(() => {
        res.status(200).json({ users: otherUsers });
      });
    });
  }
}

export default privateChatController;
