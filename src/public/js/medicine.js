/* eslint-disable consistent-return */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-undef */

let availableMedicine = [];

const insertMedicineInSortedOrder = (newMedicine) => {
  const newMedElement = createMedicineItem(newMedicine.medicinename, newMedicine.quantity);
  $('#market-list').append(newMedElement);

  // Sort the entire list of medicines
  $('#market-list .card').sort((a, b) => {
    const aText = $(a).find('.card-title').text().trim()
      .toLowerCase();
    const bText = $(b).find('.card-title').text().trim()
      .toLowerCase();
    return aText.localeCompare(bText);
  }).appendTo('#market-list');
};

const updateOrInsertMedicine = (newMedicine) => {
  let found = false;

  // Use .each() to iterate over each medicine card in the market list
  $('#market-list .card').each(function () {
    const cardTitle = $(this).find('.card-title').text().trim()
      .toLowerCase();

    // Check if the card title matches the new medicine name
    if (cardTitle === newMedicine.medicinename.toLowerCase()) {
      found = true;
      const quantityElement = $(this).find('.card-text');
      // console.log(newMedicine.quantity);
      quantityElement.text(`Quantity: ${newMedicine.quantity}`);
      return false; // Breaks the .each() loop
    }
  });
  if (!found) {
    insertMedicineInSortedOrder(newMedicine);
  }
};

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();

  socket.on('newMedicine', (medicine) => {
    if (medicine.senderName !== localStorage.getItem('username')) {
      updateOrInsertMedicine(medicine);
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
    // console.log(res.data);
    res.data.data.forEach((medicine) => {
      list += createMedicineItem(medicine.medicinename, medicine.quantity);
    });

    list = list.split('</div>').join('</div>');
    $('#market-list').html(list);
    availableMedicine = res.data.data.map((item) => item.medicinename);
    // console.log(availableMedicine);
    // console.log(res.data.data[0].medicinename);
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

  // eslint-disable-next-line no-restricted-globals
  if (quantity <= 0) {
    // console.error('Invalid medicine name or quantity');
    // alert('Invalid medicine name or quantity.');
    return; // Prevent further execution
  }

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
      })
      .catch((error) => {
        console.error('Error donating medicine:', error);
      });
  } else {
    // console.error('Invalid medicine name or quantity');
  }
});

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
});

// eslint-disable-next-line import/prefer-default-export
export { availableMedicine };
