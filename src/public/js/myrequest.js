/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */
const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('newRequest', (request) => {
    // eslint-disable-next-line no-underscore-dangle
    const newRequest = createRequestItem(request.id, request.medicineName, request.quantity, request.username);
    if (request.senderName !== localStorage.getItem('username')) {
      $('#myrequest-list').prepend(newRequest);
      notifyRequest();
    }
    // eslint-disable-next-line no-use-before-define
    // fetchUserRequests(username);
  });
  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.location = '/503page';
    }
  });

  socket.on('deleteRequest', (data) => {
    if (data.username === localStorage.getItem('username')) {
      $(`#request-${data.requestId}`).remove();
      console.log(`Request ${data.requestId} has been deleted.`);
    }
  });
};

$(window).on('load', () => {
  const myUsername = localStorage.getItem('username');
  if (myUsername) {
    axios.get(`/requests/${myUsername}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((res) => {
      console.log(res.data);
      let list = '';
      res.data.data.forEach((element) => {
        // eslint-disable-next-line no-underscore-dangle
        list += createMyRequestItem(element._id, element.medicinename, element.quantity, element.username, element.status, element.timestamp);
      });

      list = list.split('</div>').reverse().join('</div>');
      $('#myrequest-list').html(list);
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
        window.location = '/join';
      }
    });
  }

  connectSocket(myUsername);
});

$(document).on('click', '.btn-delete', function () {
  const requestId = $(this).data('id');
  axios.delete(`/requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(() => {
      $(`.card.message-card[data-id="${requestId}"]`).remove();
      console.log('hi');
      console.log(requestId);
    })
    .catch((error) => {
      console.error('Error deleting request:', error);
    });
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
