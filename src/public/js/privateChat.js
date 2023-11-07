/* eslint-disable no-undef */
// console log queries after url
const queries = new URLSearchParams(window.location.search);
const receiver = queries.get('username');

const createMyChatMessage = async (content) => createChatMessage(localStorage.getItem('username'), await getStatus(), content, Date.now());

// scroll to bottom with the new message
const scrollToBottom = () => {
  $('#chat-list').children().last()[0].scrollIntoView();
};

const fetchMessages = async (username) => axios.get(
  `/messages/private/${receiver}/${username}?isInChat=true`,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
);

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('privatemessage', (msg) => {
    const {
      senderName, status, content, timestamp,
    } = msg.content;
    if (senderName === receiver) {
      const newMsg = createChatMessage(senderName, status, content, timestamp);
      $('#chat-list').append(newMsg);
      scrollToBottom();
      fetchMessages(username).catch((err) => {
        console.error(err);
      });
    } else {
      notify(msg);
    }
  });
  socket.on('newAnnouncement', (msg) => {
    notifyAnnouncement(msg);
  });
  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.history.pushState({ page: 'originalPage' }, 'Original Page', window.location.href);
      window.location = '/503page';
    }
  });
  socket.on('stopspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.history.back();
    }
  });
};

const username = localStorage.getItem('username');
connectSocket(username);
await axios.put(
  `users/${localStorage.getItem('username')}/online`,
  null,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
).then(() => {
  console.log('set online');
}).catch((err) => {
  console.error(err);
  // if navigate to chat wall without token, should back to join page
  if (err.response.status in [401, 403]) {
    window.location = '/join';
  }
});

console.log('start fetching messages');
fetchMessages(username).then((res) => {
  let list = '';
  res.data.data.forEach((element) => {
    list += createChatMessage(
      element.senderName,
      element.status,
      element.content,
      element.timestamp,
    );
  });

  $('#chat-list').html(list);
  scrollToBottom();
}).catch((err) => {
  if (err.response.status in [401, 403]) {
    window.location = '/join';
  }
});

$('#send').on('click', () => {
  const msg = $('#message').val();
  if (msg === '') {
    return;
  }
  axios.post('/messages/private', { receiverName: receiver, content: msg }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(async () => {
    $('#message').val('');
    const newMsg = await createMyChatMessage(msg);
    $('#chat-list').append(newMsg);
    scrollToBottom();
  });
});
