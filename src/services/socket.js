// import { Server, Socket } from 'socket.io';

class SocketServer {
  constructor(io) {
    this.socketIO = io;
    this.userToSocket = new Map();
    this.socketIO.on('connection', (socket) => {
      SocketServer.handleConnection(socket, this.userToSocket);
    });
  }

  static handleConnection(socket, userToSocket) {
    const { username } = socket.handshake.auth;
    // console.log(`private a user connected ${socket.id}...`);
    // console.log('Handshake data:', socket.handshake);
    userToSocket.set(username, socket.id);
    console.log(`socketID for ${username} in list: ${userToSocket.get(username)}`);

    socket.on('disconnect', () => {
      userToSocket.set(username, null);
      console.log(`socketID for ${username} in list: ${userToSocket.get(username)}`);
    });

    // socket.on('privatemessage', ({ content, to }) => {
    //   console.log(`Private message from ${socket.id} to ${to}: ${content}`);
    // });
  }

  isConnected(username) {
    return this.userToSocket.get(username) !== null;
  }

  publishEvent(event, data) {
    this.socketIO.emit(event, data);
  }

  sendToPrivate(event, receiverName, content) {
    const receiverSocketId = this.userToSocket.get(receiverName);
    console.log(`Sending private message to ${receiverName} at ${receiverSocketId}`);
    this.socketIO.to(receiverSocketId).emit(event, {
      content,
      from: this.socketIO.id,
    });
  }
}

export default SocketServer;
