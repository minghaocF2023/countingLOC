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
  timeStamp: {
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

  static getText() {
    return this.text;
  }

  static getSenderName() {
    return this.senderName;
  }

  static getTimestamp() {
    return this.timestamp;
  }

  static getStatus() {
    return this.status;
  }

  static async getAllMessages() {
    return this.find({ });
  }
}

export default PublicMessage;
