/* global iziToast */
const notifyEvent = (event) => {
  iziToast.warning({
    title: 'New emergency event',
    message: `${event.title} at ${event.location}`,
    position: 'center',
    buttons: [
      ['<button>View</button>', () => {
        window.location = '/emergencies';
      }],
    ],
  });
};

const notifyGPSPermission = () => {
  iziToast.info({
    title: 'GPS permission not granted',
    message: 'Please enable GPS permission to allow notifications for nearby emergency events',
    position: 'topRight',
  });
};

const notifyEventHandler = (event) => {
  const dist = (a, b) => Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
  const [lat, lng] = event.coordinates;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: myLat, longitude: myLng } = position.coords;
      if (dist({ lat, lng }, { lat: myLat, lng: myLng }) < 0.1) {
        notifyEvent(event);
      }
    },
    (error) => {
      console.error(error);
      notifyGPSPermission();
    },
  );
};

window.notifyEventHandler = notifyEventHandler;
window.notifyGPSPermission = notifyGPSPermission;
window.notifyEvent = notifyEvent;
