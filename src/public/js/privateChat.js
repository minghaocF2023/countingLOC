/* eslint-disable no-undef */
// console log queries after url
import STATUS, { getStatus } from './status.js';

const queries = new URLSearchParams(window.location.search);
const receiver = queries.get('username');

const createChatMessage = (senderName, status, content, timestamp) => {
  const iconHTML = STATUS[status];
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${renderName} ${iconHTML}</h5>`;
  code += `<span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

const createMyChatMessage = async (content) => createChatMessage(localStorage.getItem('username'), await getStatus(), content, Date.now());

// scroll to bottom with the new message
const scrollToBottom = () => {
  $('#chat-list').children().last()[0].scrollIntoView();
};

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  //   socket.emit('username', localStorage.getItem('username'));
  socket.on('privatemessage', (msg) => {
    const { senderName, status, content, timestamp } = msg.content;
    if (senderName === receiver) {
      const newMsg = createChatMessage(senderName, status, content, timestamp);
      $('#chat-list').append(newMsg);
      scrollToBottom();
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
axios.get(`/messages/private/${username}/${receiver}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
}).then((res) => {
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
