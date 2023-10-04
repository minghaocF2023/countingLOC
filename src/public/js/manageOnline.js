/* eslint-disable no-undef */
const connectSocket = () => {
  const socket = io();
  socket.emit('username', localStorage.getItem('username'));
};

const newBlock = (username, status) => {
  let statusStr = '';
  if (status === true) {
    statusStr = 'online';
  } else {
    statusStr = 'offline';
  }
  let code = '';
  code += '<div class="card mb-3 user-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${username}</h5>`;
  code += `<p class="card-text"><span class="status ${statusStr}">${statusStr}</span></p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

$(window).on('load', () => {
  connectSocket();
  axios.get('/users').then((res) => {
    const userStatus = res.data.users;
    let onlineList = '';
    let offlineList = '';
    userStatus.forEach((element) => {
      if (element.isOnline === true) {
        onlineList += newBlock(element.username, element.isOnline);
      } else {
        offlineList += newBlock(element.username, element.isOnline);
      }
    });

    $('#online-user-list').html(onlineList);
    $('#offline-user-list').html(offlineList);
  });
//   const mockUserJson = [
//     { username: 'User1', isOnline: true },
//     { username: 'User2', isOnline: true },
//     { username: 'User3', isOnline: false },
//     { username: 'User4', isOnline: true },
//   ];
});
