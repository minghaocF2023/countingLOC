import mongoose from 'mongoose';

const PrivateMessageFactory = (connection) => {
  const PrivateMessageSchema = new mongoose.Schema({
    chatroomId: {
      type: mongoose.Types.ObjectId,
      ref: 'Chatroom',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // senderName: {
    //   type: String,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    // receiverName: {
    //   type: String,
    // },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    status: {
      type: String,
      required: true,
    },
    isNotified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isViewed: {
      type: Boolean,
      required: true,
      default: false,
    },
  });

  let PrivateMessageModel;
  if (connection.models.PrivateMessage) {
    PrivateMessageModel = connection.models.PrivateMessage;
  } else {
    PrivateMessageModel = connection.model('PrivateMessage', PrivateMessageSchema);
  }
  // const PrivateMessageModel = connection.model('PrivateMessage', PrivateMessageSchema);

  class PrivateMessage extends PrivateMessageModel {
    /**
     * Get all private messages
     * @param {mongoose.FilterQuery<PrivateMessage>} filter
     * @param {mongoose.ProjectionType<PrivateMessage>?=} projection
     * @param {mongoose.QueryOptions<PrivateMessage>?=} options
     * @returns {Promise<PrivateMessage[]>} array of private messages
     */
    async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((privateMessages) => privateMessages.map((pm) => new PrivateMessage(pm)));
    }

    /**
     * Get one private message
     * @param {mongoose.FilterQuery<PrivateMessage>?} filter
     * @param {mongoose.ProjectionType<PrivateMessage>?=} projection
     * @param {mongoose.QueryOptions<PrivateMessage>?=} options
     * @returns {Promise<PrivateMessage | null>} privateMessage
     */
    async getOne(filter, projection, options) {
      return this.findOne(filter, projection, options)
        .then((pm) => (pm ? new PrivateMessage(pm) : null));
    }

    getChatroomID() {
      return this.chatroomId;
    }

    getText() {
      return this.content;
    }

    async getSenderName() {
      return (await this.populate('sender')).sender.username;
    }

    async getReceiverName() {
      return (await this.populate('receiver')).receiver.username;
    }

    getTimestamp() {
      return this.timestamp;
    }

    getStatus() {
      return this.status;
    }

    getIsNotified() {
      return this.isNotified;
    }

    getIsViewed() {
      return this.isViewed;
    }

    // update message isViewed status
    static async markedAsNotified(messageId) {
      const message = await PrivateMessage.findById(messageId);
      if (message) {
        message.isNotified = true;
        await message.save().then(() => {
          console.log('updated to notified');
        });
      }
    }

    // update message isViewed status
    static async markedAsViewed(messageId) {
      const message = await PrivateMessage.findById(messageId);
      if (message) {
        message.isViewed = true;
        await message.save().then(() => {
          // console.log('updated to viewed');
        });
      }
    }

    // /**
    //  * @param {User} sender - sender
    //  * @param {User} receiver - receiver
    //  * Get all private messages between sender and receiver
    //  * @returns {Promise<PrivateMessage[]>} A promise that resolves to an array of Message's
    //  */
    // static async getMsgFromSenderReceiver(sender, receiver) {
    //   return this.find({ senderName: sender.username, receiverName: receiver.username }).then(
    //     (msgs) => msgs.map((msg) => new PrivateMessage(msg)),
    //   );
    // }
  }

  return PrivateMessage;
};

export default PrivateMessageFactory;
