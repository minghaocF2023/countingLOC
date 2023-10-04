import mongoose from '../services/db.js';

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
});

const MessageModel = mongoose.model('Message', MessageSchema);

class PublicMessage extends MessageModel {

  getText() {
    return this.text;
  }

  getSenderName() {
    return this.senderName;
  }

  getTimestamp() {
    return this.timestamp;
  }

  getStatus() {
    return this.status;
  }

  /**
   * Get all messages from the database
   * @returns {Promise<Message[]>} A promise that resolves to an array of Message's
   */
  static async getAllMessages() {
    return this.find({}).then((msgs) => msgs.map((msg) => new Message(msg)));
  }
}

export default PublicMessage;
