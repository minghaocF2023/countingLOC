const connectSocket = (username) => {
  // const socket = io();
  // eslint-disable-next-line no-undef
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('stopspeedtest', (user) => {
    console.log('stop');
    if (localStorage.getItem('username') !== user) {
      window.history.back();
    }
  });
};

// eslint-disable-next-line no-undef
$(window).on('load', () => {
  connectSocket(localStorage.getItem('username'));
});
