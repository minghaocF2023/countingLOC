/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();

  socket.on('newMedicine', (medicine) => {
    console.log('enter');
    const newMedElement = createMedicineItem(medicine.medicinename, medicine.quantity);
    console.log(medicine.medicinename);
    if (medicine.senderName !== localStorage.getItem('username')) {
      $('#market-list').prepend(newMedElement);
    }
  });

//   socket.on('startspeedtest', (user) => {
//     if (localStorage.getItem('username') !== user) {
//       window.location = '/503page';
//     }
//   });
};

$(window).on('load', () => {
  console.log('enter');
  axios.get('/market/medicines', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    let list = '';
    console.log(res.data);
    res.data.data.forEach((medicine) => {
      list += createMedicineItem(medicine.medicinename, medicine.quantity);
    });

    list = list.split('</div>').join('</div>');
    $('#market-list').html(list);
  }).catch((err) => {
    if (err.response && err.response.data && err.response.data.message === 'User not logged in') {
      window.location = '/join';
    }
  });
  connectSocket(localStorage.getItem('username'));
});

$('#submit-medicine-btn').on('click', () => {
  const medicineName = $('#medicineName').val().trim();
  const quantity = parseInt($('#medicineQuantity').val(), 10);

  if (medicineName && quantity > 0) {
    axios.post('/market/medicines', {
      medicinename: medicineName,
      quantity,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => {
        console.log('Medicine donated successfully', response.data);
        $('#staticBackdrop').modal('hide');
        // Optionally refresh or update the list of medicines on the page
      })
      .catch((error) => {
        console.error('Error donating medicine:', error);
        // Handle the error, for example by showing a message to the user
      });
  } else {
    // Handle the case where the name or quantity is not entered correctly
    console.error('Invalid medicine name or quantity');
    // Optionally show an error message to the user
  }
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});
