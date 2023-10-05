import mongoose from '../services/db.js';

const PublicMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  senderName: {
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

const PublicMessageModel = mongoose.model('PublicMessage', PublicMessageSchema);

class PublicMessage extends PublicMessageModel {
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
    return this.find({}).then((msgs) => msgs.map((msg) => new PublicMessage(msg)));
  }
}

export default PublicMessage;
