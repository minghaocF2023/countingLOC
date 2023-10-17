const ChatroomFactory = (mongoose) => {
  const ChatroomSchema = new mongoose.Schema({
    senderName: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
  });

  const ChatroomModel = mongoose.model('Chatroom', ChatroomSchema);

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
      return this._id;
    }

    getSenderName() {
      return this.senderName;
    }

    getReceiverName() {
      return this.receiverName;
    }
  }

  return Chatroom;
};

export default ChatroomFactory;
