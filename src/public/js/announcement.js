/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */

const createAnnouncementMessage = (senderName, content, timestamp) => {
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title flex-grow-1">${renderName}</h5>`;
  code += `<span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('newAnnouncement', (msg) => {
    const newMsg = createAnnouncementMessage(msg.senderName, msg.content, msg.timestamp);
    console.log(msg.senderName);
    console.log(localStorage.getItem('username'));
    if (msg.senderName !== localStorage.getItem('username')) {
      $('#announce-list').prepend(newMsg);
      notifyAnnouncement(msg.senderName);
    }
  });
  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.location = '/503page';
    }
  });
};

$(window).on('load', () => {
  axios.get('/messages/announcement', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    let list = '';
    res.data.data.forEach((element) => {
      list += createAnnouncementMessage(element.senderName, element.content, element.timestamp);
    });
    // reverse the list
    list = list.split('</div>').reverse().join('</div>');
    $('#announce-list').html(list);
  }).catch((err) => {
    if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
  connectSocket(localStorage.getItem('username'));
});

$('#submit-announcement-btn').on('click', () => {
  const msg = $('#exampleFormControlTextarea1').val();
  console.log(`Message: ${msg}`);
  const requestUrl = '/messages/announcement';

  axios.post(requestUrl, { content: msg }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    console.log('Announcement sent successfully');
    $('#exampleFormControlTextarea1').val('');
    const newMsg = createAnnouncementMessage('Me', msg, new Date().toISOString());
    // $('#announce-list').append(newMsg);
    $('#announce-list').prepend(newMsg);
  }).catch((err) => {
    console.error('Error sending message:', err);
    if (err.response) {
      console.error('Error Data:', err.response.data);
    }
  });
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
