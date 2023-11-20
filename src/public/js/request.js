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
      // eslint-disable-next-line no-underscore-dangle
      list += createRequestItem(element._id, element.medicinename, element.quantity, element.username, element.status, element.timestamp);
    });
    // reverse the list
    list = list.split('</div>').reverse().join('</div>');
    $('#request-list').html(list);
  }).catch((err) => {
    if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
//   // Fetch and display user-specific requests
//   const myUsername = localStorage.getItem('username');
//   if (myUsername) {
//     // eslint-disable-next-line no-use-before-define
//     fetchUserRequests(myUsername);
//   }
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
  console.log(id);
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
    });
};

$('#submit-request-button').on('click', () => {
//   console.log('hi');
  const medicinename = $('#medicineName').val().trim();
  const quantity = parseInt($('#medicineQuantity').val(), 10);
  console.log(medicinename);

  if (!medicineName || quantity <= 0) {
    console.error('Invalid medicine name or quantity');
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
      $('#medicineName').val('');
      $('#medicineQuantity').val('');
    })
    .catch((error) => {
      console.error('Error creating request:', error);
    });
});

// const fetchUserRequests = (username) => {
//   axios.get(`/requests/${username}`, { // Adjust the URL according to your API route
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're using token-based authentication
//     },
//   })
//     .then((response) => {
//       const { requests } = response.data.data;
//       console.log(requests);
//       const requestsList = document.getElementById('myrequest-list');
//       requestsList.innerHTML = '';

//       requests.forEach((request) => {
//         // eslint-disable-next-line no-underscore-dangle
//         const requestCard = createMyRequestItem(request._id, request.medicinename, request.quantity, request.timestamp, request.status); // Assuming you have a function to create the HTML for a request
//         requestsList.prepend(requestCard);
//       });
//     })
//     .catch((error) => {
//       console.error('Error fetching user requests:', error);
//       // Handle error (e.g., show error message)
//     });
// };

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
