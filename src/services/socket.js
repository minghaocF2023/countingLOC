// import { Server, Socket } from 'socket.io';

class SocketServer {
  static _instance;

  constructor(io) {
    this.socketIO = io;
    this.socketIO.on('connection', (socket) => {
      console.log(`a user connected ${socket.id}`);
    });
    SocketServer._instance = this;
  }

  publishEvent(event, data) {
    this.socketIO.emit(event, data);
  }
}

export default SocketServer;
