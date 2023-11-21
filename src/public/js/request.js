/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */
import { availableMedicine } from './medicine.js';

const standardizeMedicineName = (name) => name
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .split(' ')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('newRequest', (request) => {
    // eslint-disable-next-line no-underscore-dangle
    const newRequest = createRequestItem(request.id, request.medicineName, request.quantity, request.username);
    if (request.senderName !== localStorage.getItem('username')) {
      $('#request-list').prepend(newRequest);
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
  socket.on('medicineUpdated', (data) => {
    $(`.card[data-medicinename="${data.medicinename}"] .medicine-quantity`).text(data.newQuantity);
  });
};

$(window).on('load', () => {
  axios.get('/requests', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    // console.log(res.data);
    let list = '';
    res.data.data.forEach((element) => {
      // eslint-disable-next-line no-underscore-dangle
      list += createRequestItem(element._id, element.medicinename, element.quantity, element.username, element.status, element.timestamp);
    });
    // reverse the list
    list = list.split('</div>').reverse().join('</div>');
    $('#request-list').html(list);
    // console.log(availableMedicine);
  }).catch((err) => {
    if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
  connectSocket(localStorage.getItem('username'));
});

// eslint-disable-next-line func-names
$(document).on('click', '.btn-approve', function () {
  const requestId = $(this).attr('data-id'); // Retrieve the request ID
  // eslint-disable-next-line no-use-before-define
  updateRequestStatus(requestId, 'Approved');
});

// eslint-disable-next-line func-names
$(document).on('click', '.btn-reject', function () {
  const requestId = $(this).attr('data-id');
  // eslint-disable-next-line no-use-before-define
  updateRequestStatus(requestId, 'Rejected');
});

const updateRequestStatus = (id, newStatus) => {
  axios.put(`/requests/${id}`, { status: newStatus }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then((response) => {
      $(`.card.message-card[data-id="${id}"] .status-text`).text(`Status: ${newStatus}`);
      $(`.card.message-card[data-id="${id}"] .btn-approve, .card.message-card[data-id="${id}"] .btn-reject`).prop('disabled', true);
    })
    .catch((error) => {
      console.error('Error updating request status:', error);
      if (error.response && error.response.status === 400) {
        // Handle insufficient stock error
        iziToast.error({
          title: 'Error',
          position: 'topCenter',
          message: error.response.data.message,
        });
      }
    });
};

$('#submit-request-button').on('click', (e) => {
  // const medicinename = $('#medicineName').val().trim();
  const medicinename = standardizeMedicineName($('#medicineName').val().trim());
  const quantity = parseInt($('#medicineQuantity').val(), 10);
  // console.log(medicinename);

  if (quantity <= 0) {
    return; // Prevent further execution
  }

  if (!availableMedicine.includes(medicinename)) {
    return;
  }

  axios.post('/requests', {
    medicinename,
    quantity,
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then((response) => {
      console.log('Request created successfully:', response.data);
      window.location.href = '/requestConfirmation';
      $('#medicineName').val('');
      $('#medicineQuantity').val('');
    })
    .catch((error) => {
      console.error('Error creating request:', error);
    });
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
