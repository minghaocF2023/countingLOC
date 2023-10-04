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
  // constructor(text, senderName, timestamp, status) {
  //   super(text, senderName, timestamp, status);
  // }

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

  static async getAllMessages() {
    return this.find({});
  }
}

export default PublicMessage;
