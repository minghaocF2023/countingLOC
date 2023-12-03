// import mongoose from '../services/db.js';
import mongoose from 'mongoose';

const PublicMessageFactory = (connection) => {
  if (connection.models.PublicMessage) {
    return connection.models.PublicMessage;
  }
  const PublicMessageSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    // senderName: {
    //   type: String,
    //   required: true,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
  });

  let PublicMessageModel;
  if (connection.models.PublicMessage) {
    PublicMessageModel = connection.models.PublicMessage;
  } else {
    PublicMessageModel = connection.model('PublicMessage', PublicMessageSchema);
  }
  // const PublicMessageModel = connection.model('PublicMessage', PublicMessageSchema);

  class PublicMessage extends PublicMessageModel {
    /**
     * Get all public messages
     * @param {mongoose.FilterQuery<PrivateMessage>} filter
     * @param {mongoose.ProjectionType<PrivateMessage>?=} projection
     * @param {mongoose.QueryOptions<PrivateMessage>?=} options
     * @returns {Promise<PrivateMessage[]>} array of private messages
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((publicMessages) => publicMessages.map((pm) => new PublicMessage(pm)));
    }

    getText() {
      return this.text;
    }

    async getSender() {
      return (await this.populate('sender')).sender;
    }

    getTimestamp() {
      return this.timestamp;
    }

    getStatus() {
      return this.status;
    }

    static async createPublicChat(data) {
      const newChat = new this(data);
      await newChat.save();
      return newChat;
    }

    /**
     * Get all messages from the database
     * @returns {Promise<PublicMessage[]>} A promise that resolves to an array of Message's
     */
    static async getAllMessages() {
      return this.find({}).then((msgs) => msgs.map((msg) => new PublicMessage(msg)));
    }
  }

  return PublicMessage;
};

export default PublicMessageFactory;
