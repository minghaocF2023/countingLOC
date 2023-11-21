/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef

const confirmAddAvailability = () => new Promise((resolve, reject) => {
  iziToast.question({
    timeout: 20000,
    close: false,
    overlay: true,
    displayMode: 'once',
    id: 'question',
    zindex: 1100,
    title: 'Confirm Adding Availability',
    message: 'Do you really want to add these time slots? You won\'t be able to change or delete them after confirming.',
    position: 'center',
    buttons: [
      ['<button><b>YES</b></button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOut', onClosing: () => resolve() }, toast, 'button');
      }, true],
      ['<button>NO</button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOut', onClosing: () => reject() }, toast, 'button');
      }, false],
    ],
  });
});

const showConfirmationAlert = () => {
  iziToast.show({
    title: 'Confirmation',
    message: 'Time Slot(s) Added Successfully',
    position: 'center',
    buttons: [
      ['<button>Close</button>', function (instance, toast) {
        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
      }],
    ],
  });
};

function toggleAddAvailabilityButton(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const isToday = date.getTime() === today.getTime();
  const addAvailabilityButton = document.getElementById('addAvailabilityButton');
  if (isToday) {
    addAvailabilityButton.style.display = 'none';
  } else {
    addAvailabilityButton.style.display = 'block';
  }
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

function reapplySelectedDateHighlight() {
  const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  $('.selected-date').removeClass('selected-date');

  $(`[data-date="${formattedSelectedDate}"]`).addClass('selected-date');
}

function updateModalTitleWithSelectedDate() {
  const formattedDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  document.getElementById('selectedDate').textContent = formattedDate;
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

function updateBookedList(appointments) {
  const bookedList = document.getElementById('booked-list');
  bookedList.innerHTML = '';
  if (appointments.length === 0) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
          <div class="card-body">
              <p class="card-text">No appointments booked</p>
          </div>
      `;
    bookedList.appendChild(card);
  }
  appointments.sort((a, b) => a.startTime - b.startTime);
  if (appointments.length > 0) {
    appointments.forEach((appt) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `
          <div class="card-body">
              <h5 class="card-title">Appointment with ${appt.patientUsername}</h5>
              <p class="card-text">Time: ${formatTime(appt.startTime)}</p>
          </div>
      `;
      bookedList.appendChild(card);
    });
  }
}

function updateVacantList(timeslots) {
  const vacantList = document.getElementById('vacant-list');
  vacantList.innerHTML = '';
  if (timeslots.length === 0) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.innerHTML = `
          <div class="card-body">
              <p class="card-text">No vacant time slots</p>
          </div>
      `;
    vacantList.appendChild(card);
  }
  timeslots.sort((a, b) => a - b);
  if (timeslots.length > 0) {
    timeslots.forEach((time) => {
      const card = document.createElement('div');
      card.className = 'card mb-3';
      card.innerHTML = `
          <div class="card-body">
              <p class="card-text">Time: ${formatTime(time)}</p>
          </div>
      `;
      vacantList.appendChild(card);
    });
  }
}

async function fetchAppointmentsForDate(date) {
  // Fetch booked appointments
  axios.get(`/doctorAppointment/doctorappt?date=${date}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((response) => {
    const bookedAppointments = [];
    const vacantTimeslots = [];
    const { appointments } = response.data;
    if (appointments.length === 0) {
      updateBookedList([]);
      updateVacantList([]);
      return;
    }
    appointments.forEach((appt) => {
      if (appt.patientUsername === '') {
        vacantTimeslots.push(appt.startTime);
      } else {
        bookedAppointments.push(appt);
      }
      updateBookedList(bookedAppointments);
      updateVacantList(vacantTimeslots);
    });
  }).catch((error) => {
    console.error(error);
  });
}

function updateTimeSlotsModal(timeSlots) {
  const container = $('#timeSlotsContainer');
  container.empty();
  console.log(container);
  if (timeSlots.length === 0) {
    const noTimeSlotsMessage = document.createElement('p');
    noTimeSlotsMessage.textContent = 'No time slots available';
    container.append(noTimeSlotsMessage);
    return;
  }
  timeSlots.forEach((time) => {
    const timeSlotButton = document.createElement('button');
    timeSlotButton.className = 'btn btn-outline-primary time-slot';
    timeSlotButton.textContent = formatTime(time);
    timeSlotButton.dataset.time = time;
    container.append(timeSlotButton);

    // Attach click event listener for selection
    timeSlotButton.addEventListener('click', () => {
      timeSlotButton.classList.toggle('selected');
    });
  });
}

async function fetchAndDisplayTimeSlots(date) {
  try {
    const response = await axios.get(`/doctorAppointment/doctortimeslot?date=${date}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const timeSlots = response.data.timeslots;
    updateTimeSlotsModal(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
  }
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
      toggleAddAvailabilityButton(info.date);
      $('.selected-date').removeClass('selected-date');
      updateTitleDate(info.dateStr);
      updateModalTitleWithSelectedDate();
      const clickedDate = $(info.dayEl);
      if (!clickedDate.hasClass('fc-today')) {
        clickedDate.addClass('selected-date');
      }
      fetchAppointmentsForDate(info.dateStr);
    },
  });

  calendar.render();
  toggleAddAvailabilityButton(new Date());
  const today = new Date();
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  updateTitleDate(initialDateStr);
  fetchAppointmentsForDate(initialDateStr);

  $('#addAvailabilityButton').on('click', () => {
    const selectedDateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    $('#addAvailabilityModal').modal('show');
    $('#timeSlotsContainer').empty();
    fetchAndDisplayTimeSlots(selectedDateStr);
  });

  $('#addAvailabilityModal').on('show.bs.modal', () => {
    $('#timeSlotsContainer').empty();
  });

  $('#addAvailabilityModal').on('hidden.bs.modal', () => {
    $('#timeSlotsContainer').empty();
  });

  // Enable multiple selection for .time-slot elements
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach((timeSlot) => {
    timeSlot.addEventListener('click', () => {
      timeSlot.classList.toggle('selected');
    });
  });

  $('#submit-availability-btn').on('click', async () => {
    try {
      await confirmAddAvailability();
      // Proceed if the doctor confirms
      const selectedTimeSlots = [];
      $('.selected').each((index, element) => {
        selectedTimeSlots.push(undoFormatTime(element.textContent));
      });

      $('.selected').removeClass('selected');

      const newAvailability = {
        date: selectedDate.toISOString().split('T')[0],
        startTimes: selectedTimeSlots,
      };

      const response = await fetch('/doctorAppointment/newavailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newAvailability),
      });

      if (response.ok) {
        console.log('Availability added successfully');
        fetchAppointmentsForDate(selectedDate.toISOString().split('T')[0]);
        showConfirmationAlert();
      } else {
        console.error('Failed to add availability');
      }
      $('#addAvailabilityModal').modal('hide');
    } catch (error) {
      // Doctor chose 'NO' or closed the iziToast
      console.log('Adding availability canceled.');
    }
  });
});

$(window).on('load', () => {
  $("button[type='submit']").prop('disabled', false);
  $('#search-navbar').hide();
  $('#search-icon').hide();
  $('#addAvailabilityButton').hide();
});
