/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef

let isUpdating = false;
let oldAppointmentDetails = {};

function isToday(dateStr) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  return dateStr === todayStr;
}

function toggleBookMoreButton(date) {
  const bookMoreButton = document.getElementById('bookMoreButton');
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  if (isToday(dateStr)) {
    bookMoreButton.style.display = 'none';
  } else {
    bookMoreButton.style.display = 'block';
  }
}

function formatTime(time) {
  const hour = parseInt(time, 10);
  const ampm = hour < 12 ? 'am' : 'pm';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}${ampm}`;
}

function undoFormatTime(time) {
  const formattedTime = time.replace('am', '').replace('pm', '');
  const hour = parseInt(formattedTime, 10);
  if (time.includes('am') || hour === 12) {
    return hour;
  }
  return hour + 12;
}

function createNoAppointmentCard() {
  const card = document.createElement('div');
  card.className = 'card mb-3';
  card.innerHTML = '<div class="card-body"><p class="card-text">No appointments booked</p></div>';
  return card;
}

function createAppointmentCard(appt) {
  const card = document.createElement('div');
  card.className = 'card mb-3';
  let buttonsHtml = '';
  if (!isToday(appt.date)) {
    buttonsHtml = `
      <button class="btn btn-danger delete-button">Delete</button>
      <button class="btn update-button" style="background-color: rgb(236, 200, 127);">Update</button>
    `;
  }
  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Appointment with ${appt.doctorUsername}</h5>
      <p class="card-text">Time: ${formatTime(appt.startTime)}</p>
      ${buttonsHtml}
    </div>
  `;
  return card;
}

function updateBookedList(appointments) {
  const bookedList = document.getElementById('booked-list');
  bookedList.innerHTML = ''; // Clear existing appointments

  if (appointments.length === 0) {
    const noApptCard = createNoAppointmentCard();
    bookedList.appendChild(noApptCard);
  } else {
    appointments.sort((a, b) => a.startTime - b.startTime);
    appointments.forEach((appt) => {
      const card = createAppointmentCard(appt);
      bookedList.appendChild(card);
    });
  }
}

let bookedTimes = [];

async function fetchAppointmentsForDate(date) {
  // Fetch booked appointments
  axios.get(`/patientAppointment/patientappt?date=${date}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((response) => {
    const bookedAppointments = [];
    const { appointments } = response.data;
    if (appointments.length === 0) {
      updateBookedList([]);
      bookedTimes = [];
      return;
    }
    appointments.forEach((appt) => {
      bookedAppointments.push(appt);
      bookedTimes.push(appt.startTime);
      updateBookedList(bookedAppointments);
    });
  }).catch((error) => {
    console.error(error);
  });
}

let selectedDate = new Date(); // Variable to keep track of the selected date

function updateTitleDate(dateStr) {
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);

  // Construct the date in local time zone
  selectedDate = new Date(year, month - 1, day);

  // Manually format the date to avoid timezone issues
  const formattedDate = `${month}/${day}/${year}`;
  document.getElementById('title-date-selected').textContent = `You selected: ${formattedDate}`;
}

function updateAvailableDoctorsTimeSlotsModal(doctors) {
  const container = $('#doctorAvailabilityList');
  container.empty();
  if (doctors.length === 0) {
    container.append('<p>No doctors available on this date</p>');
    return;
  }
  doctors.forEach((doctor) => {
    // Filter out booked times and sort the remaining times
    const availableTimes = doctor.availableTimes
      .filter((time) => !bookedTimes.includes(time))
      .sort((a, b) => a - b); // Sorting the times in ascending order

    if (availableTimes.length > 0) {
      const doctorDiv = $('<div class="doctor-availability"></div>');
      doctorDiv.append(`<h4>${doctor.doctorUsername}</h4>`);
      const timeSlotsDiv = $('<div class="time-slots"></div>');

      availableTimes.forEach((time) => {
        const timeSlotButton = $(`<button type="button" class="btn btn-outline-primary appointment-time-slot" data-doctor="${doctor.doctorUsername}" data-time="${formatTime(time)}">${formatTime(time)}</button>`);
        timeSlotsDiv.append(timeSlotButton);
      });

      doctorDiv.append(timeSlotsDiv);
      container.append(doctorDiv);
      container.append('<hr class="doctor-separator">');
    }
  });
}

async function fetchAndDisplayTimeSlots(date) {
  try {
    const response = await axios.get(`/patientAppointment/getdoctorsavailability?date=${date}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const { doctors } = response.data;
    updateAvailableDoctorsTimeSlotsModal(doctors);
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
}

function reapplySelectedDateHighlight() {
  // Format the selected date to match FullCalendar's data-date format
  const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Remove previous highlights
  $('.selected-date').removeClass('selected-date');

  // Find the cell with the selected date and add the highlight class
  $(`[data-date="${formattedSelectedDate}"]`).addClass('selected-date');
}

function updateModalTitleWithSelectedDate() {
  const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('selectedDate').textContent = formattedDate;
}

document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    validRange: {
      start: new Date(),
    },
    datesSet(dateInfo) {
      reapplySelectedDateHighlight();
    },
    dateClick(info) {
      toggleBookMoreButton(info.date);
      $('.selected-date').removeClass('selected-date');
      updateTitleDate(info.dateStr);
      updateModalTitleWithSelectedDate();
      bookedTimes = [];
      const clickedDate = $(info.dayEl);
      if (!clickedDate.hasClass('fc-today')) {
        clickedDate.addClass('selected-date');
      }
      fetchAppointmentsForDate(info.dateStr);
    },
  });

  calendar.render();
  toggleBookMoreButton(new Date());
  const today = new Date();
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  updateTitleDate(initialDateStr);
  fetchAppointmentsForDate(initialDateStr);

  $('#bookMoreButton').on('click', () => {
    const selectedDateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    $('#bookMoreModal').modal('show');
    $('#doctorAvailabilityList').empty();
    fetchAndDisplayTimeSlots(selectedDateStr);
  });

  $('#bookMoreModal').on('show.bs.modal', () => {
    $('#doctorAvailabilityList').empty();
  });

  $('#bookMoreModal').on('hidden.bs.modal', () => {
    $('#doctorAvailabilityList').empty();
  });

  // Event listener for single selection of time slots
  $('#doctorAvailabilityList').on('click', '.appointment-time-slot', function () {
    // Remove the 'selected' class from any previously selected time slots
    $('.appointment-time-slot.selected').removeClass('selected');
    $(this).addClass('selected');
  });

  function handleResponse(response) {
    if (response.data.success) {
      fetchAppointmentsForDate(selectedDate.toISOString().split('T')[0]);
      $('#bookMoreModal').modal('hide');
    }
  }

  function handleError(error) {
    console.error(error);
  }

  // Event listener for the submit button
  document.getElementById('submit-bookmore-btn').addEventListener('click', () => {
    const selectedTimeSlotElement = document.querySelector('.appointment-time-slot.selected');
    if (selectedTimeSlotElement) {
      const selectedTimeSlot = undoFormatTime(selectedTimeSlotElement.getAttribute('data-time'));
      const selectedDoctor = selectedTimeSlotElement.getAttribute('data-doctor');

      const selectedDateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

      if (isUpdating) {
        // Update existing appointment
        axios.put('/patientAppointment/updateappointment', {
          ...oldAppointmentDetails,
          dateNew: selectedDateStr,
          startTimeNew: selectedTimeSlot,
          doctorUsernameNew: selectedDoctor,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(handleResponse).catch(handleError);
      } else {
        // Create new appointment
        axios.post('/patientAppointment/newappointment', {
          date: selectedDateStr,
          startTime: selectedTimeSlot,
          doctorUsername: selectedDoctor,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(handleResponse).catch(handleError);
      }

      // Reset update state
      isUpdating = false;
      oldAppointmentDetails = {};
    }
  });

  $('#booked-list').on('click', '.delete-button', function () {
    const appointmentCard = $(this).closest('.card');
    const doctorUsername = appointmentCard.find('.card-title').text().replace('Appointment with ', '');
    const time = undoFormatTime(appointmentCard.find('.card-text').text().replace('Time: ', ''));

    const selectedDateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    axios.delete(`/patientAppointment/deleteappointment?date=${selectedDateStr}&startTime=${time}&doctorUsername=${doctorUsername}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      if (response.data.success) {
        fetchAppointmentsForDate(selectedDateStr);
      }
    }).catch((error) => {
      console.error(error);
    });
  });

  $('#booked-list').on('click', '.update-button', function () {
    const appointmentCard = $(this).closest('.card');
    const doctorUsernameOld = appointmentCard.find('.card-title').text().replace('Appointment with ', '');
    const startTimeOld = undoFormatTime(appointmentCard.find('.card-text').text().replace('Time: ', ''));

    oldAppointmentDetails = {
      dateOld: selectedDate.toISOString().split('T')[0],
      startTimeOld,
      doctorUsernameOld,
    };

    isUpdating = true;
    $('#bookMoreModal').modal('show');
    $('#doctorAvailabilityList').empty();
    fetchAndDisplayTimeSlots(selectedDate.toISOString().split('T')[0]);
  });
});

$(window).on('load', () => {
  $("button[type='submit']").prop('disabled', false);
  // hide id="search-navbar" in nav bar
  $('#search-navbar').hide();
  $('#search-icon').hide();
  $('#bookMoreButton').hide();
});
