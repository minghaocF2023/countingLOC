// import { Server, Socket } from 'socket.io';

class PrivateSocketServer {
  constructor(io) {
    this.socketIO = io;
    this.userToSocket = new Map();
    this.socketIO.on('connection', (socket) => {
      PrivateSocketServer.handleConnection(socket, this.userToSocket);
    });
  }

  static handleConnection(socket, userToSocket) {
    console.log(`private a user connected ${socket.id}...`);
    userToSocket.set();
    console.log(`userlist: ${this.userToSocket}`);

    socket.on('disconnect', () => {
      console.log(`a user disconnected ${socket.id}`);
    });

    // socket.on('privatemessage', ({ content, to }) => {
    //   console.log(`Private message from ${socket.id} to ${to}: ${content}`);
    // });
  }

  sendToPrivate(receiverName, content) {
    const receiverSocketId = this.userToSocket.get(receiverName);
    this.socketIO.to(receiverSocketId).emit('privatemessage', {
      content,
      from: this.socketIO.id,
    });
  }
}

export default PrivateSocketServer;
