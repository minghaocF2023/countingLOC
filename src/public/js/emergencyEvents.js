/* global io, axios, notify, notifyAnnouncement, createEmergencyEventBlock */
/* global iziToast, notifyGPSPermission, notifyEventHandler */

const compareByTime = (a, b) => a.time - b.time;

const connectSocket = (username) => {
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();

  socket.on('startspeedtest', (user) => {
    if (localStorage.getItem('username') !== user) {
      window.location = '503page';
    }
  });

  socket.on('newAnnouncement', notifyAnnouncement);
  socket.on('privatemessage', notify);
  socket.on('emergency', notifyEventHandler);
};

const showSuccess = (title, message, cb) => {
  iziToast.success({
    title,
    message,
    position: 'center',
    buttons: [
      ['<button>OK</button>', cb],
    ],
    onClosing: cb,
  });
};

const setGPS = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        $('#lat').val(position.coords.latitude);
        $('#lng').val(position.coords.longitude);
      },
      (error) => {
        console.error(error);
        notifyGPSPermission();
      },
    );
  }
};

const setTime = () => {
  const date = new Date();
  // HH:mm
  $('#time').val(date.toTimeString().substring(0, 5));
};

$(window).on('load', () => {
  $('#search-icon').hide();
});

$(window).on('DOMContentLoaded', async () => {
  await axios.put(
    `users/${localStorage.getItem('username')}/online`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).catch((err) => {
    console.error(err);
    window.location = '/join';
  });

  connectSocket(localStorage.getItem('username'));

  // get esn directory info
  await axios.get(
    '/emergency/events',
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then((res) => {
    const events = res.data.events.sort(compareByTime).reverse();

    $('#emergency-event-list').append(events.map(createEmergencyEventBlock));
  });

  $('#report').on('click', () => {
    $('#event-form')[0].reset();
    $('#event-form button[type=submit]').text('Submit');
    $('button#delete').addClass('d-none');
    $('#event-form button').removeAttr('data-id');
    $('.emergency-events').addClass('d-none');
    $('.emergency-event-editor').removeClass('d-none');
    setGPS();
    setTime();
  });

  $('#cancel').on('click', () => {
    $('.emergency-events').removeClass('d-none');
    $('.emergency-event-editor').addClass('d-none');
    $('#event-form')[0].reset();
    $('#event-form button[type=submit]').text('Submit');
    $('button#delete').addClass('d-none');
    $('#event-form button').removeAttr('data-id');
  });

  $('.edit-button').on('click', async (e) => {
    const { id } = e.currentTarget.dataset;
    const event = await axios.get(
      `/emergency/events/${id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
      .then((res) => res.data.event)
      .catch((err) => {
        console.error(err);
        return null;
      });
    if (!event) {
      return;
    }
    $('.emergency-events').addClass('d-none');
    $('#event-form')[0].reset();
    $('input#title').val(event.title);
    $('textarea#description').val(event.description);
    $('input#location').val(event.location);
    const [rangeAffected, unit] = event.range_affected.split(' ');
    $('input#range_affected').val(rangeAffected);
    $('select#unit').val(unit);
    $('input#severity').val(event.severity);
    const date = new Date(event.timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    $('input#time').val(`${hours}:${minutes}`);
    if (event.coordinates) {
      $('input#lat').val(event.coordinates[0]);
      $('input#lng').val(event.coordinates[1]);
    }
    $('#event-form button').attr('data-id', id);
    $('#event-form button[type=submit]').text('Update');
    $('button#delete').removeClass('d-none');
    $('.emergency-event-editor').removeClass('d-none');
  });

  $('#event-form').on('submit', async (e) => {
    e.preventDefault();
    $('#event-form button').attr('disabled', '');
    const data = Object.fromEntries(new FormData(e.target));
    // time
    const { time } = data;
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    data.timestamp = date.getTime();
    delete data.time;
    // range
    // eslint-disable-next-line camelcase
    const { range_affected, unit } = data;
    // eslint-disable-next-line camelcase
    data.range_affected = `${range_affected} ${unit}`;
    delete data.unit;
    // coordinates
    if (data.lat && data.lng) {
      data.coordinates = [Number(data.lat), Number(data.lng)];
      delete data.lat;
      delete data.lng;
    }

    const { id } = e.originalEvent.submitter.dataset;
    const method = id ? axios.put : axios.post;
    const url = id ? `/emergency/events/${id}` : '/emergency/events';
    const notification = id ? 'Event updated' : 'Event reported';
    await method(
      url,
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    ).then(() => {
      showSuccess('Success', notification, window.location.reload.bind(window.location));
    }).catch((err) => {
      console.error(err);
      e.target.reset();
    });
  });

  $('button#delete').on('click', async (e) => {
    const { id } = e.currentTarget.dataset;
    await axios.delete(
      `/emergency/events/${id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    ).then(() => {
      showSuccess('Success', 'Event deleted', window.location.reload.bind(window.location));
    }).catch((err) => {
      console.error(err);
    });
  });
});
