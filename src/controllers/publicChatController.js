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
class publicChatController {
  // create new message:
  // TODO:
  static async getLatestMessages(req, res) {
    validateToken(req.headers.authorization);
    // TODO:
  }

  static async postNew(req, res) {
    // TODO:
    if (!req.params.text) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }
    const {
      text, senderName, timestamp, status,
    } = req.body;
    const newMessage = new PublicMessage(text, senderName, timestamp, status);
    await newMessage.save();
    res.status(201);
    res.json(newMessage);
  }

  // static async updatePublicWall(req, res) {

  // }
}
export default publicChatController;
