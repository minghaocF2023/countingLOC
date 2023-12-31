import mongoose from 'mongoose';

const ChatroomFactory = (connection) => {
  const ChatroomSchema = new mongoose.Schema({
    // senderName: {
    //   type: String,
    // },
    // receiverName: {
    //   type: String,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  });

  let ChatroomModel;
  if (connection.models.Chatroom) {
    ChatroomModel = connection.models.Chatroom;
  } else {
    ChatroomModel = connection.model('Chatroom', ChatroomSchema);
  }
  // const ChatroomModel = connection.model('Chatroom', ChatroomSchema);

  class Chatroom extends ChatroomModel {
    /**
     * Get all chatrooms
     * @param {mongoose.FilterQuery<Chatroom>} filter
     * @param {mongoose.ProjectionType<Chatroom>?=} projection
     * @param {mongoose.QueryOptions<Chatroom>?=} options
     * @returns {Promise<Chatroom[]>} array of users
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((chatrooms) => chatrooms.map((chatroom) => new Chatroom(chatroom)));
    }

    /**
       * Get one chatroom
       * @param {mongoose.FilterQuery<Chatroom>?} filter
       * @param {mongoose.ProjectionType<Chatroom>?=} projection
       * @param {mongoose.QueryOptions<Chatroom>?=} options
       * @returns {Promise<Chatroom | null>} user
       */
    static async getOne(filter, projection, options) {
      return this.findOne(filter, projection, options)
        .then((chatroom) => (chatroom ? new Chatroom(chatroom) : null));
    }

    getChatroomId() {
      // eslint-disable-next-line no-underscore-dangle
      const idObject = new mongoose.Types.ObjectId(this._id);
      return idObject;
    }
  }

  return Chatroom;
};

export default ChatroomFactory;
