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
};

$(window).on('load', () => {
  // Fetch and display user-specific requests
  const myUsername = localStorage.getItem('username'); // Retrieve the username from localStorage
  if (myUsername) {
    axios.get(`/requests/${myUsername}`, { // Use template literal to insert the username into the URL
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you're using token-based authentication
      },
    }).then((res) => {
      console.log(res.data);
      let list = '';
      res.data.data.forEach((element) => {
        // Ensure createRequestItem is a function that returns an HTML string for each request
        // eslint-disable-next-line no-underscore-dangle
        list += createMyRequestItem(element._id, element.medicinename, element.quantity, element.username, element.status, element.timestamp);
      });
      // Add the list to the 'myrequest-list' element in reverse order
      list = list.split('</div>').reverse().join('</div>');
      $('#myrequest-list').html(list); // Make sure 'myrequest-list' is the correct ID of your container element
    }).catch((err) => {
      if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
        window.location = '/join'; // Redirect to login if not logged in
      }
    });
  }

  connectSocket(myUsername); // Establish WebSocket connection
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
