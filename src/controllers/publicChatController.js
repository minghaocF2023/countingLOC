import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import PublicMessage from '../models/messageModel.js';
import socketServer from '../../app.js';

const TOKEN_SECRET = 'Some secret keys';

// const httpServer = http.createServer();
// const io = new Server(httpServer);
const validateToken = (token) => {
  jwt.verify(token, TOKEN_SECRET);
};

// io.on('connection', (socket) => {
//   console.log('A chat socket connected:', socket.id);
// });

/**
 * @typedef {{
 *  senderName: string,
 *  content: string,
 *  status: string,
 *  timestamp: string
 * }} Message
 */

class publicChatController {
  socket = null;

  constructor() {
    socketServer.on('connection', (socket) => {
      this.socket = socket;
    });
  }
  
  //get previous messages
  static async getLatestMessages(req, res) {
    if(!req.headers.authorization){
      res.status(403).json({message: "Empty token"});
    }
    console.log("Token: "+req.headers.authorization.split(" ")[1]);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  
    validateToken(req.headers.authorization.split(" ")[1]);
    //sort messages by timestamp
    const messages = await PublicMessage.find().sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: messages });
  }

  //post new messages
  static async postNew(req, res) {
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

    // io.emit('newMessage', newMessage);
    socketServer.publishEvent('newMessage', newMessage);

    res.status(201).json({ success: true, data: newMessage });
  }

}
export default publicChatController;
