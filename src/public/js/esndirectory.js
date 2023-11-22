/* eslint-disable no-undef */
const compareString = (a, b) => a.localeCompare(b);

const appendNewUser = (div, username, isOnline, status, profileImage, isContact) => {
  // user already in div
  if (div.children(`#${username}`).length > 0) {
    return;
  }
  // remove another entry
  $(`#${username}`).remove();
  // add new online block
  const newList = div.children();
  const newUser = createUserBlock(username, isOnline, status, profileImage, isContact);
  newList.push(newUser);
  // sort
  newList.sort((a, b) => compareString(a.id, b.id));
  div.empty();
  div.append(newList);
};

const connectSocket = (username) => {
  // const socket = io();
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('userOnlineStatus', (msg) => {
    console.log(msg);
    console.log(` someone login:${msg.username} ${msg.isOnline} ${msg.status}`);

    const onlineListDiv = $('#online-user-list');
    const offlineListDiv = $('#offline-user-list');

    appendNewUser(
      msg.isOnline ? onlineListDiv : offlineListDiv,
      msg.username,
      msg.isOnline,
      msg.status,
    );
  });

  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.location = '503page';
    }
  });

  socket.on('newStatus', (msg) => {
    console.log(msg);
    console.log(` someone change status:${msg.username} ${msg.status}`);
    $(`#${msg.username} h5`).html(`${msg.username} ${STATUS[msg.status]}`);
  });

  socket.on('newAnnouncement', (msg) => {
    notifyAnnouncement(msg);
  });

  socket.on('privatemessage', (msg) => notify(msg));
};

const compareByUsername = (a, b) => a.username.localeCompare(b.username);

$(window).on('DOMContentLoaded', async () => {
  // if unauthorized -> it is okay to stay at esndirectory (currently)
  await axios.put(
    `users/${localStorage.getItem('username')}/online`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then(() => {
    console.log('set status online');
  });

  connectSocket(localStorage.getItem('username'));

  // get esn directory info
  axios.get('/users', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    const userOnlineStatus = res.data.users.sort(compareByUsername);
    const onlineList = [];
    const offlineList = [];
    userOnlineStatus.forEach((element) => {
      if (element.isOnline) {
        onlineList.push(createUserBlock(
          element.username,
          element.isOnline,
          element.status,
          element.profileImage ? element.profileImage : null,
          element.isContact,
        ));
      } else {
        offlineList.push(createUserBlock(
          element.username,
          element.isOnline,
          element.status,
          element.profileImage
            ? element.profileImage : null,
          element.isContact,
        ));
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
