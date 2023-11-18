/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef

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
      // toggleAddAvailabilityButton(dateInfo.start);
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
    },
  });

  calendar.render();
  toggleAddAvailabilityButton(new Date());
  const today = new Date();
  const initialDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  updateTitleDate(initialDateStr);

  // Enable multiple selection for .time-slot elements
  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach((timeSlot) => {
    timeSlot.addEventListener('click', () => {
      timeSlot.classList.toggle('selected');
    });
  });

  $('#submit-availability-btn').on('click', () => {
    // Get the selected time slots
    const selectedTimeSlots = [];
    $('.selected').each((index, element) => {
      selectedTimeSlots.push(element.textContent);
    });
    console.log(selectedTimeSlots);
    // clear the selected time slots
    $('.selected').removeClass('selected');
    // #TODO: re-render the availability section to show the new availability (re GET)
  });
});

$(window).on('load', () => {
  $("button[type='submit']").prop('disabled', false);
  // hide id="search-navbar" in nav bar
  $('#search-navbar').hide();
  $('#search-icon').hide();
  $('#addAvailabilityButton').hide();
});
