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
    const sockets = userToSocket.get(username) || [];
    if (!sockets.includes(socket.id)) {
      sockets.push(socket.id);
    }
    userToSocket.set(username, sockets);
    // console.log(`socketID for ${username} in list: ${userToSocket.get(username)}`);

    socket.on('disconnect', () => {
      const existingSocket = userToSocket.get(username);
      if (existingSocket.length === 1) {
        userToSocket.delete(username);
      } else {
        const newSocketList = existingSocket.filter((id) => id !== socket.id);
        userToSocket.set(username, newSocketList);
      }
    });

    // socket.on('privatemessage', ({ content, to }) => {
    //   console.log(`Private message from ${socket.id} to ${to}: ${content}`);
    // });
  }

  isConnected(username) {
    const sockets = this.userToSocket.get(username);
    return sockets && sockets.length > 0;
  }

  publishEvent(event, data) {
    this.socketIO.emit(event, data);
  }

  sendToPrivate(event, receiverName, content) {
    const socketIds = this.userToSocket.get(receiverName);
    if (!socketIds) {
      console.info(`User ${receiverName} is not online`);
      return;
    }
    console.log(`Sending private message to ${receiverName} at ${socketIds}`);
    socketIds.forEach((socketId) => {
      this.socketIO.to(socketId).emit(event, {
        content,
        from: this.socketIO.id,
      });
    });
  }
}

export default SocketServer;
