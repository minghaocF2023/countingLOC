const PrivateMessageFactory = (mongoose) => {
  const PrivateMessageSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
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

  const PrivateMessageModel = mongoose.model('PrivateMessage', PrivateMessageSchema);

  class PrivateMessage extends PrivateMessageModel {
    getText() {
      return this.text;
    }

    getSenderName() {
      return this.senderName;
    }

    getReceiverName() {
      return this.receiverName;
    }

    getTimestamp() {
      return this.timestamp;
    }

    getStatus() {
      return this.status;
    }

    /**
     * @param {User} sender - sender
     * @param {User} receiver - receiver
     * Get all private messages between sender and receiver
     * @returns {Promise<PrivateMessage[]>} A promise that resolves to an array of Message's
     */
    static async getMsgFromSenderReceiver(sender, receiver) {
      return this.find({ senderName: sender.username, receiverName: receiver.username }).then(
        (msgs) => msgs.map((msg) => new PrivateMessage(msg)),
      );
    }
  }

  return PrivateMessage;
};

export default PrivateMessageFactory;
