import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

// helper functions
const getPrivateMessageData = (pm) => {
  if (pm) {
    return {
      chatroomId: pm.getChatroomID(),
      content: pm.getText(),
      senderName: pm.getSenderName(),
      receiverName: pm.getReceiverName(),
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
const createNewPrivateMessage = async (targetChatroom, payload, userModel, content, receiverName) => ({
  chatroomId: targetChatroom.getChatroomId(),
  content,
  senderName: payload.username,
  receiverName,
  timestamp: Date.now(),
  status: (await userModel.getOne({ username: payload.username })).status,
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

    const query = {
      $or: [
        { senderName: targetUser, receiverName: currentUser },
        { senderName: currentUser, receiverName: targetUser },
      ],
    };

    let anyMessageUnread = false;
    let anyMessageNotNotified = false;
    const messageToBeNotified = [];
    const messageToBeViewed = [];

    this.privateChatModel.find(query).then((privateMessages) => {
      const resData = [];
      // organize response data
      privateMessages.forEach(async (pm) => {
        const message = getPrivateMessageData(pm);
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
          data: resData,
          messageUnread: !isInChat && anyMessageUnread,
          messageToBeNotified: anyMessageNotNotified,
        };

        // success
        res.status(200).json(response);
      }).catch(() => res.status(500).json({ message: 'Database error' }));
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
    const query = {
      $or: [
        { senderName, receiverName },
        { senderName: receiverName, receiverName: senderName },
      ],
    };

    this.chatroomModel.getOne(query).then(async (chatroom) => {
      // if not found, create a new chatroom
      let targetChatroom = chatroom;
      if (!targetChatroom) {
        // eslint-disable-next-line new-cap
        const newChatroom = new this.chatroomModel({
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

      const data = await createNewPrivateMessage(
        targetChatroom,
        payload,
        this.userModel,
        content,
        receiverName,
      );

      // eslint-disable-next-line new-cap
      const newPrivateMessage = new this.privateChatModel(data);
      await newPrivateMessage.save();

      // broadcast to receiver
      const socketServer = req.app.get('socketServer');
      socketServer.sendToPrivate('privatemessage', receiverName, data);
      await newPrivateMessage.updateOne({ isNotified: socketServer.isConnected(receiverName) });

      res.status(201).json({ success: true, data: newPrivateMessage });
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

    this.userModel.getOne(userQuery).then(async (user) => {
      // eslint-disable-next-line new-cap
      const chatrooms = user.getChatrooms();

      // eslint-disable-next-line prefer-const
      const otherUsers = [];
      const taskList = [];
      chatrooms.forEach((chatroomId) => {
        const task = new Promise((resolve) => {
          this.chatroomModel.findById(chatroomId).then(async (chatroom) => {
            if (chatroom) {
              const otherUser = chatroom.senderName
              === username ? chatroom.receiverName : chatroom.senderName;
              if (!otherUsers.includes(otherUser)
                // filter out inactive users
                && (await this.userModel.getOne({ username: otherUser }))?.isActive) {
                otherUsers.push(otherUser);
              }
            } else {
              console.error(`chatroom ${chatroomId} not found for user ${username}`);
            }
            resolve();
          });
        });
        taskList.push(task);
      });

      Promise.all(taskList).then(async () => {
        res.status(200).json({ users: otherUsers });
      });
    });
  }

  async deletePrivateMessage(req, res) {
    this.privateChatModel.deleteMany({
      senderName: req.body.senderName,
      receiverName: req.body.receiverName,
    }).then(() => {
      res.status(200).json({ message: 'deleted' });
    });
  }
}

export default privateChatController;
