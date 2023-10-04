import { Server, Socket } from 'socket.io';

// io.on('connection', (socket) => {
//   console.log(`a user connected ${socket.id}`);
//   socket.on('username', (msg) => {
//     console.log(msg);
//   });
// });
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
// class socket {
//   io = null;

//   constructor(server) {
//     this.io = new Server(server);
//   }
// }
export default SocketServer;
