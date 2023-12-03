/* eslint-disable no-underscore-dangle */
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

// helper functions
const getPrivateMessageData = async (pm) => {
  if (pm) {
    return {
      chatroomId: pm.getChatroomID(),
      content: pm.getText(),
      senderName: await pm.getSenderName(),
      receiverName: await pm.getReceiverName(),
      status: pm.getStatus(),
      timestamp: pm.getTimestamp(),
      isNotified: pm.getIsNotified(),
      isViewed: pm.getIsViewed(),
    };
  }
  return null;
};

const notViewedByCurrentUser = (msg, currentUser) => msg.isViewed === false
 && msg.receiverName === currentUser;

const notNotifiedToCurrentUser = (msg, currentUser) => msg.isNotified === false
 && msg.receiverName === currentUser;

// eslint-disable-next-line max-len
/**
 * @param {Chatroom} targetChatroom
 * @param {string} content
 * @param {User} sender
 * @param {User} receiver
 */
const createNewPrivateMessage = async (targetChatroom, content, sender, receiver) => ({
  chatroomId: targetChatroom.getChatroomId(),
  content,
  sender: sender._id,
  receiver: receiver._id,
  timestamp: Date.now(),
  status: sender.status,
  isViewed: false,
  isNotified: false,
});

class privateChatController {
  // constructor
  constructor(privateChatModel, chatroomModel, userModel) {
    this.privateChatModel = privateChatModel;
    this.chatroomModel = chatroomModel;
    this.userModel = userModel;
  }

  async getLatestMessageBetweenUsers(req, res) {
    const { targetUser, currentUser } = req.params;
    const isInChat = req.query.isInChat === 'true';
    if (!targetUser || !currentUser) {
      res.status(400).json({ message: 'Both targetUser and currentUser are required' });
      return;
    }

    // check auth
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const targetUserId = await this.userModel.getIdByUsername(targetUser);
    const currentUserId = await this.userModel.getIdByUsername(currentUser);

    const query = {
      $or: [
        { sender: targetUserId, receiver: currentUserId },
        { sender: currentUserId, receiver: targetUserId },
      ],
    };

    let anyMessageUnread = false;
    let anyMessageNotNotified = false;
    const messageToBeNotified = [];
    const messageToBeViewed = [];

    await this.privateChatModel.find(query).then((privateMessages) => {
      const resData = [];
      // organize response data
      const taskList = privateMessages.map(async (pm) => {
        const message = await getPrivateMessageData(pm);
        if (notNotifiedToCurrentUser(message, currentUser)) {
          // eslint-disable-next-line no-underscore-dangle
          messageToBeNotified.push(pm._id);
          message.isNotified = true;
          anyMessageNotNotified = true;
        }

        // if already in private chatroom, and if any message is not viewed, update as viewed
        if (isInChat && notViewedByCurrentUser(message, currentUser)) {
          // eslint-disable-next-line no-underscore-dangle
          messageToBeViewed.push(pm._id);
          message.isViewed = true;
        }
        resData.push(message);

        // if any messages is not viewed yet, set anyMessageUnread as true
        if (notViewedByCurrentUser(message, currentUser)) {
          anyMessageUnread = true;
        }
      });

      Promise.all(taskList).then(() => {
        // update message isNotified status
        const changeToNotifiedTaskList = [];
        messageToBeNotified.forEach((messageId) => {
          const task = new Promise((resolve) => {
            this.privateChatModel.markedAsNotified(messageId).then(() => {
              resolve();
            });
          });
          changeToNotifiedTaskList.push(task);
        });

        const changeToViewedTaskList = [];
        messageToBeViewed.forEach((messageId) => {
          const task = new Promise((resolve) => {
            this.privateChatModel.markedAsViewed(messageId).then(() => {
              resolve();
            });
          });
          changeToViewedTaskList.push(task);
        });

        Promise.all(changeToViewedTaskList.concat(changeToNotifiedTaskList)).then(() => {
          // if user is not in chatroom, messageUnread = false
          const response = {
            message: 'OK',
            data: resData.sort((a, b) => a.timestamp - b.timestamp),
            messageUnread: !isInChat && anyMessageUnread,
            messageToBeNotified: anyMessageNotNotified,
          };

          // success
          res.status(200).json(response);
        }).catch(() => res.status(500).json({ message: 'Database error' }));
      });
    });
  }

  /**
   * send a new private message
   */
  async postNewPrivate(req, res) {
    const { content, receiverName } = req.body;
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    // search the chatroom belongs to the sender and receiver
    const senderName = payload.username;

    const sender = await this.userModel.getIdByUsername(senderName);
    const receiver = await this.userModel.getIdByUsername(receiverName);
    const query = {
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    };

    this.chatroomModel.getOne(query).then(async (chatroom) => {
      // if not found, create a new chatroom
      let targetChatroom = chatroom;
      if (!targetChatroom) {
        // eslint-disable-next-line new-cap
        // better add try-catch clause for error handling
        const newChatroom = new this.chatroomModel({
          sender,
          receiver,
        });
        await newChatroom.save();
        const userQuery = {
          $or: [
            { _id: sender },
            { _id: receiver },
          ],
        };
        this.userModel.get(userQuery).then((users) => {
          users.forEach(async (user) => {
            const userId = user.getUserId();
            const chatrooms = user.getChatrooms();
            chatrooms.push(newChatroom.getChatroomId());
            this.userModel.updateDoc({ _id: userId }, { chatrooms });
          });
        });
        targetChatroom = newChatroom;
      }

      // create private message object
      const data = await createNewPrivateMessage(
        targetChatroom,
        content,
        await this.userModel.getOne({ _id: sender }), // get sender object
        await this.userModel.getOne({ _id: receiver }), // get receiver object
      );

      // eslint-disable-next-line new-cap
      // create db obejct and save to private message db
      const newPrivateMessage = new this.privateChatModel(data);
      await newPrivateMessage.save();

      // broadcast to receiver
      const socketServer = req.app.get('socketServer');
      const message = await newPrivateMessage.populate('sender receiver');
      socketServer.sendToPrivate('privatemessage', receiverName, message);
      await newPrivateMessage.updateOne({ isNotified: socketServer.isConnected(receiverName) });

      res.status(201).json({ success: true, data: await newPrivateMessage.populate('sender receiver') });
    });
  }

  /**
   * get all private users that have chatted with ME
   */
  async getAllPrivate(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { username } = payload;
    // user -> getChatroom -> another user -> append to result array
    const userQuery = { username };
    // eslint-disable-next-line prefer-const

    const user = await this.userModel.findOne(userQuery).populate('chatrooms').sort({ timestamp: -1 });
    const { chatrooms } = user;
    const otherUsers = [];
    const taskList = chatrooms.map(async (cr) => {
      const chatroom = await cr.populate('sender receiver');
      const otherUser = chatroom.sender.name === username ? chatroom.receiver : chatroom.sender;
      if (!otherUsers.includes(otherUser) && (otherUser.isActive)) {
        otherUsers.push(otherUser);
      }
    });

    Promise.all(taskList).then(() => {
      res.status(200).json({ users: otherUsers.map((u) => u.username) });
    });
  }

  async deletePrivateMessage(req, res) {
    const sender = await this.userModel.getIdByUsername(req.body.senderName);
    const receiver = await this.userModel.getIdByUsername(req.body.receiverName);
    this.privateChatModel.deleteMany({
      sender,
      receiver,
    }).then(() => {
      res.status(200).json({ message: 'deleted' });
    });
  }
}

export default privateChatController;
