import { Server } from 'socket.io';
import server from '../../app.js';

const io = new Server(server);

io.on('connection', (socket) => {
  console.log(`a user connected ${socket.id}`);
  socket.on('username', (msg) => {
    console.log(msg);
  });
});
