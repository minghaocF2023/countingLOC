/* eslint-disable no-undef */
const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  //   socket.emit('username', localStorage.getItem('username'));
  //   console.log('connect socket');
  socket.on('privatemessage', (msg) => {
    console.log(msg);
  });
};

$(window).on('load', () => {
  connectSocket(localStorage.getItem('username'));
});
