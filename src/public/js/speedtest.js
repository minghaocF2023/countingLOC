/* eslint-disable no-undef */
const TEST_CONTENT = 'test'.repeat(5);
let postSent = 0; // should not exceed 1000
let postCount = 0;
let getCount = 0;
let testId = 0;
let getId = 0;

let stop = true;

const authToken = localStorage.getItem('token');

const testPost = (interval) => setInterval(() => {
  axios.post(
    '/messages/public',
    { content: TEST_CONTENT },
    { headers: { Authorization: `Bearer ${authToken}` }, params: { istest: 'true' } },
  ).then(() => {
    postCount += 1;
    postSent += 1;
    if (postSent >= 1000) {
      clearInterval(testId);
    }
  });
}, interval);

const testGet = (interval) => setInterval(() => {
  axios.get(
    '/messages/public',
    { headers: { Authorization: `Bearer ${authToken}` }, params: { istest: 'true' } },
  ).then(() => {
    getCount += 1;
  });
}, interval);

const startTest = async () => axios.post(
  '/admin/startspeedtest',
  null,
  { headers: { Authorization: `Bearer ${authToken}` } },
).then(() => {
  console.log('speed test initiated');
}).catch((err) => {
  console.warn(err.response.data);
});

const stopTest = async () => axios.post(
  '/admin/stopspeedtest',
  null,
  { headers: { Authorization: `Bearer ${authToken}` } },
).then(() => {
  console.log('speed test stopped');
}).catch((err) => {
  console.warn(err.response.data);
});

/**
 * Start speed test
 */
$('form').on('submit', async (e) => {
  e.preventDefault();
  stop = false;
  postSent = 0; // should not exceed 1000
  postCount = 0;
  getCount = 0;
  const duration = $('#duration').val() / 2;
  const interval = $('#interval').val();
  // initiate speed test
  await startTest();

  // test post
  if (!stop) {
    console.log('start test post');
    testId = testPost(interval);
    setTimeout(() => clearInterval(testId), duration * 1000);
    setTimeout(() => $('#post-performance').html(postCount / duration), duration * 1000);
  }
  // test get
  setTimeout(() => {
    if (!stop) {
      console.log('start test get');
      getId = testGet(interval);
      setTimeout(() => clearInterval(getId), duration * 1000);
      setTimeout(() => $('#get-performance').html(getCount / duration), duration * 1000);
    }
  }, duration * 1000 + 2000);

  // stop speed test
  setTimeout(() => {
    if (!stop) {
      stopTest();
      stop = true;
    }
  }, duration * 2 * 1000);
});

/**
 * Stop speed test manually
 */
$('#stopButton').on('click', () => {
  stop = true;
  clearInterval(testId);
  clearInterval(getId);
  stopTest();
});

const connectSocket = (username) => {
  // const socket = io();
  // eslint-disable-next-line no-undef
  const socket = io(undefined, { autoConnect: false });
  socket.auth = { username };
  socket.connect();
  socket.on('startspeedtest', (msg) => {
    if (localStorage.getItem('username') !== msg.username) {
      window.history.pushState({ page: 'originalPage' }, 'Original Page', window.location.href);
      window.location = '/503page';
    }
  });
};
// eslint-disable-next-line no-undef
$(window).on('load', () => {
  connectSocket(localStorage.getItem('username'));
});
