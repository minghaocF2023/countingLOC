/* eslint-disable no-undef */
const TEST_CONTENT = 'test'.repeat(5);
let postCount = 0;
let getCount = 0;
let testId = 0;
let getId = 0;
let postController;
let getController;

let stop = true;

const authToken = localStorage.getItem('token');

/**
 * Show a error message on the top right corner
 * @param {string} infoTitle title of error message
 * @param {string} infoMessage content of error message
 */
const showTestError = (errorTitle, errorMessage) => {
  iziToast.warning({
    title: errorTitle,
    message: errorMessage,
    position: 'topRight',
  });
};

/**
 * Show a error message on the top right corner
 * @param {string} infoTitle title of info message
 * @param {string} infoMessage content of info message
 */
const showTestInfo = (infoTitle, infoMessage) => {
  iziToast.info({
    title: infoTitle,
    message: infoMessage,
    position: 'topRight',
  });
};

/**
 * Send post requests per `interval` milliseconds
 * @param {number} interval number of milliseconds between each post request
 * @returns {number} id of the interval
 */
const testPost = (interval, signal) => setInterval(() => {
  axios.post(
    '/messages/public',
    { content: TEST_CONTENT },
    { headers: { Authorization: `Bearer ${authToken}` }, params: { isspeedtest: 'true' }, signal },
  ).then(() => {
    postCount += 1;
  });
}, interval);

/**
 * Send get requests per `interval` milliseconds
 * @param {number} interval number of milliseconds between each get request
 * @returns {number} id of the interval
 */
const testGet = (interval, signal) => setInterval(() => {
  axios.get(
    '/messages/public',
    { headers: { Authorization: `Bearer ${authToken}` }, params: { isspeedtest: 'true' }, signal },
  ).then(() => {
    getCount += 1;
  });
}, interval);

/**
 * Notify server to start speed test
 * @returns promise
 */
const startTest = async () => axios.post(
  '/admin/startspeedtest',
  null,
  { headers: { Authorization: `Bearer ${authToken}` } },
).then(() => {
  console.log('speed test initiated');
}).catch((err) => {
  console.warn(err.response.data);
});

/**
 * Notify server to stop speed test
 * @returns promise
 */
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
  postCount = 0;
  getCount = 0;
  const duration = $('#duration').val() / 2;
  const interval = $('#interval').val();
  $('#post-performance').html('-');
  $('#get-performance').html('-');
  // check if duration too long
  if ((duration * 1000) / interval > 1000) {
    showTestError('Speed test', 'Duration too long. Choose a shorter duration or a longer interval');
    return;
  }
  // initiate speed test
  await startTest().then(() => {
    showTestInfo('Speed test', 'Speed test started');
    $("button[type='submit']").prop('disabled', true);
    $('#stopButton').prop('disabled', false);
  }).catch(() => {
    showTestError('Speed test', 'Speed test failed to start');
    stopTest();
    stop = true;
  });

  // test post
  postController = new AbortController();
  getController = new AbortController();
  if (!stop) {
    console.log('start test post');
    testId = testPost(interval, postController.signal);
    setTimeout(() => clearInterval(testId), duration * 1000);
    setTimeout(() => postController.abort(), duration * 1000);
    setTimeout(() => !stop && $('#post-performance').html(postCount / duration), duration * 1000);
  }
  // test get
  setTimeout(() => {
    if (!stop) {
      console.log('start test get');
      getId = testGet(interval, getController.signal);
      setTimeout(() => clearInterval(getId), duration * 1000);
      setTimeout(() => getController.abort(), duration * 1000);
      setTimeout(() => !stop && $('#get-performance').html(getCount / duration), duration * 1000);
    }
  }, duration * 1000 + 100);

  // stop speed test
  setTimeout(() => {
    if (!stop) {
      stopTest();
      showTestInfo('Speed test', 'Speed test ended');
      $("button[type='submit']").prop('disabled', false);
      $('#stopButton').prop('disabled', true);
      stop = true;
    }
  }, duration * 2 * 1000 + 200);
});

/**
 * Stop speed test manually
 */
$('#stopButton').on('click', () => {
  stop = true;
  clearInterval(testId);
  clearInterval(getId);
  postController.abort();
  getController.abort();
  stopTest();
  showTestInfo('Speed test', 'Speed test stopped');
  $("button[type='submit']").prop('disabled', false);
  $('#stopButton').prop('disabled', true);
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
  $("button[type='submit']").prop('disabled', false);
});
