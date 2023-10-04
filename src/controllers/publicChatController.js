import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import PublicMessage from '../models/messageModel.js';

const httpServer = http.createServer();
const io = new Server(httpServer);
const validateToken = (token) => {
  jwt.verify(token, process.env.TOKEN_SECRET);
};

io.on('connection', (socket) => {
  console.log('A chat socket connected:', socket.id);
});

/**
 * @typedef {{
 *  senderName: string,
 *  content: string,
 *  status: string,
 *  timestamp: string
 * }} Message
 */

class publicChatController {
  // create new message:
  // TODO:
  static async getLatestMessages(req, res) {
    validateToken(req.headers.authorization);
    // TODO:
    const messages = await PublicMessage.find().sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  static async postNew(req, res) {
    // TODO:

    validateToken(req.headers.authorization);

    if (!req.params.text) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const {
      content, senderName, timestamp, status,
    } = req.body;
    const newMessage = new PublicMessage(content, senderName, timestamp, status);
    await newMessage.save();

    io.emit('newMessage', newMessage);

    res.status(201).json({ success: true, data: newMessage });
  }

  // static async updatePublicWall(req, res) {

  // }
}
export default publicChatController;
