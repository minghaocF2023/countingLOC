/* eslint-disable max-len */
/* eslint-disable no-undef */

const createChatMessage = (senderName, status, content, timestamp) => {
  const STATUS = {
    OK: '<i class="fas fa-check-circle" style="color:green"></i>',
    help: '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>',
    emergency: '<i class="fas fa-exclamation-triangle" style="color:red"></i>',
  };
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

// scroll to bottom with the new message
const scrollToBottom = () => {
  $('#chat-list').children().last()[0].scrollIntoView();
};

const connectSocket = () => {
  const socket = io();
  socket.on('newMessage', (msg) => {
    const newMsg = createChatMessage(msg.senderName, msg.status, msg.content, msg.timestamp);
    $('#chat-list').append(newMsg);
  });
};

const startSpeedTest = (isTest) => {
  axios.post('admin/startspeedtest', { isTest }).then((res) => {
    console.log(res);
  });
};

$('.speed-test').on('click', () => {
  startSpeedTest();
});
// $(document).ready(() => {
//   $('#speedTestSwitch').on('change', function () {
//     if ($(this).prop('checked')) {
//       startSpeedTest(true);
//     } else {
//       startSpeedTest(false);
//     }
//   });
// });

$(window).on('load', () => {
  axios.put(
    `users/${localStorage.getItem('username')}/online`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then(() => {
    // if authorized -> start fetching public messages

  }).catch((err) => {
    // if navigate to chat wall without token, should back to join page
    if (err.response.data.message === 'Unauthorized Request') {
      window.location = '/join';
    }
  });

  console.log('start fetching messages');
  axios.get('/messages/public', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    let list = '';
    res.data.data.forEach((element) => {
      list += createChatMessage(element.senderName, element.status, element.content, element.timestamp);
    });

    $('#chat-list').html(list);
    scrollToBottom();
  }).catch((err) => {
    if (err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
  connectSocket();
});

$('#send').on('click', () => {
  const msg = $('#message').val();
  axios.post('/messages/public', { content: msg }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(() => {
    $('#message').val('');
    scrollToBottom();
  });
});
