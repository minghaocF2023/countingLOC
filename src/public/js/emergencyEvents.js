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
  axios.get(
    '/emergency/events',
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then((res) => {
    const events = res.data.events.sort(compareByTime).reverse();

    $('#emergency-event-list').append(events.map(createEmergencyEventBlock));
  });

  $('#report').on('click', () => {
    $('.emergency-events').addClass('d-none');
    $('.emergency-event-editor').removeClass('d-none');
    setGPS();
    setTime();
  });

  $('#cancel').on('click', () => {
    $('.emergency-events').removeClass('d-none');
    $('.emergency-event-editor').addClass('d-none');
    $('#event-form')[0].reset();
  });

  $('#event-form').on('submit', async (e) => {
    e.preventDefault();
    $('#event-form button').attr('disabled', '');
    const data = Object.fromEntries(new FormData(e.target));
    const { time } = data;
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    data.timestamp = date.getTime();
    delete data.time;
    if (data.lat && data.lng) {
      data.coordinates = [Number(data.lat), Number(data.lng)];
      delete data.lat;
      delete data.lng;
    }
    await axios.post(
      '/emergency/events',
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    ).then(() => {
      showSuccess('Success', 'Event reported', window.location.reload.bind(window.location));
    }).catch((err) => {
      console.error(err);
      e.target.reset();
    });
  });
});
