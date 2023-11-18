/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef

function toggleBookMoreButton(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const isToday = date.getTime() === today.getTime();
  const bookMoreButton = document.getElementById('bookMoreButton');
  if (isToday) {
    bookMoreButton.style.display = 'none';
  } else {
    bookMoreButton.style.display = 'block';
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
      // toggleBookMoreButton(dateInfo.start);
      reapplySelectedDateHighlight();
    },
    dateClick(info) {
      toggleBookMoreButton(info.date);
      $('.selected-date').removeClass('selected-date');
      updateTitleDate(info.dateStr);
      updateModalTitleWithSelectedDate();
      const clickedDate = $(info.dayEl);
      if (!clickedDate.hasClass('fc-today')) {
        clickedDate.addClass('selected-date');
      }
    },
  });

  calendar.render();
  toggleBookMoreButton(new Date());
  const today = new Date();
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  updateTitleDate(initialDateStr);

  // Event listener for single selection of time slots
  document.querySelectorAll('.appointment-time-slot').forEach((timeSlot) => {
    timeSlot.addEventListener('click', () => {
    // Deselect any currently selected time slot
      const currentlySelected = document.querySelector('.appointment-time-slot.selected');
      if (currentlySelected) {
        currentlySelected.classList.remove('selected');
      }

      // Select the clicked time slot
      timeSlot.classList.add('selected');
    });
  });

  // Event listener for the submit button
  document.getElementById('submit-bookmore-btn').addEventListener('click', () => {
  // Get the selected time slot
    const selectedTimeSlotElement = document.querySelector('.appointment-time-slot.selected');
    if (selectedTimeSlotElement) {
      const selectedTimeSlot = selectedTimeSlotElement.getAttribute('data-time');
      const selectedDoctor = selectedTimeSlotElement.getAttribute('data-doctor');
      console.log(`Selected Time Slot: ${selectedTimeSlot}, Doctor: ${selectedDoctor}`);

      // Clear the selected time slot after submission
      selectedTimeSlotElement.classList.remove('selected');
      // #TODO: re-render the booked section to show the new appointment (re GET)
    }
  });
});

$(window).on('load', () => {
  $("button[type='submit']").prop('disabled', false);
  // hide id="search-navbar" in nav bar
  $('#search-navbar').hide();
  $('#search-icon').hide();
  $('#bookMoreButton').hide();
});
