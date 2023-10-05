/* eslint-disable no-undef */
const newBlock = (username, status) => {
  const statusStr = status ? 'online' : 'offline';

  const div = document.createElement('div');
  div.id = username;
  div.className = 'card mb-3 user-card';
  div.innerHTML = '<div class="card-body">'
    + `<h5 class="card-title">${username}</h5>`
    + `<p class="card-text"><span class="status ${statusStr}">${statusStr}</span></p>`
    + '</div>'
    + '</div>';
  return div;
};

const compareString = (a, b) => a.localeCompare(b);

const appendNewUser = (div, username, isOnline) => {
  // user already in div
  if (div.children(`#${username}`).length > 0) {
    return;
  }
  // remove another entry
  $(`#${username}`).remove();
  // add new online block
  const newList = div.children();
  const newUser = newBlock(username, isOnline);
  newList.push(newUser);
  // sort
  newList.sort((a, b) => compareString(a.id, b.id));
  div.empty();
  div.append(newList);
};

const connectSocket = () => {
  const socket = io();
  socket.emit('username', localStorage.getItem('username'));
  console.log('connect socket');
  socket.on('userOnlineStatus', (msg) => {
    console.log(`someone login:${msg.username} ${msg.isOnline}`);

    const onlineListDiv = $('#online-user-list');
    const offlineListDiv = $('#offline-user-list');

    appendNewUser(msg.isOnline ? onlineListDiv : offlineListDiv, msg.username, msg.isOnline);
  });
};

const compareByUsername = (a, b) => a.username.localeCompare(b.username);

$(window).on('load', () => {
  // if unauthorized -> it is okay to stay at esndirectory (currently)
  axios.put(
    `users/${localStorage.getItem('username')}/online`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then(() => {
    console.log('set status online');
  });

  connectSocket();

  // get esn directory info
  axios.get('/users').then((res) => {
    const userStatus = res.data.users.sort(compareByUsername);
    const onlineList = [];
    const offlineList = [];
    userStatus.forEach((element) => {
      if (element.isOnline === true) {
        onlineList.push(newBlock(element.username, element.isOnline));
      } else {
        offlineList.push(newBlock(element.username, element.isOnline));
      }
    });

    $('#online-user-list').append(onlineList);
    $('#offline-user-list').append(offlineList);
  });
});

// if not logged in -> change button text to login
if (!localStorage.getItem('token')) {
  $('#logout').html('Login');
}