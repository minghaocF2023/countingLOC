/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('newRequest', (request) => {
    const newRequest = createRequestItem(request.medicineName, request.quantity, request.username);
    if (request.senderName !== localStorage.getItem('username')) {
      $('#request-list').prepend(newRequest);
    }
  });
  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.location = '/503page';
    }
  });
};

$(window).on('load', () => {
  axios.get('/requests', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    console.log(res.data);
    let list = '';
    res.data.data.forEach((element) => {
      list += createRequestItem(element.medicinename, element.quantity, element.username, element.status, element.timestamp);
    });
    // reverse the list
    list = list.split('</div>').reverse().join('</div>');
    $('#request-list').html(list);
  }).catch((err) => {
    if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
  connectSocket(localStorage.getItem('username'));
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
