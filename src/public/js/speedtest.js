const TEST_CONTENT = 'a' * 20;
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
    { headers: { Authorization: `Bearer ${authToken}` } },
  ).then(() => {
    console.log('post');
    postCount += 1;
    postSent += 1;
    console.log(postSent);
    if (postSent >= 1000) {
      clearInterval(testId);
    }
  });
}, interval);

const testGet = (interval) => setInterval(() => {
  axios.get(
    '/messages/public',
    null,
    { headers: { Authorization: `Bearer ${authToken}` } },
  ).then(() => {
    console.log('get');
    getCount += 1;
  });
}, interval);

/**
 * Start speed test
 */
$('form').on('submit', async (e) => {
  e.preventDefault();
  stop = false;
  postSent = 0; // should not exceed 1000
  postCount = 0;
  getCount = 0;
  const duration = $('#duration').val() * (1000 / 2);
  const interval = $('#interval').val();
  // initiate speed test
  // await axios.post(
  //   '/admin/speedtest',
  //   { duration, interval },
  //   { headers: { Authorization: `Bearer ${authToken}` } },
  // ).then(() => {
  //   console.log('speed test initiated');
  // }).catch((err) => {
  //   console.warn(err.response.data);
  // });

  // test post
  if (!stop) {
    console.log('start test post');
    testId = testPost(interval);
    setTimeout(() => clearInterval(testId), duration);
    setTimeout(() => $('#post-performance').html(postCount / duration), duration);
  }
  // test get
  setTimeout(() => {
    if (!stop) {
      console.log('start test get');
      getId = testGet(interval);
      setTimeout(() => clearInterval(getId), duration);
      setTimeout(() => $('#get-performance').html(getCount / duration), duration);
    }
  }, duration);
});

/**
 * Stop speed test
 */
$('#stopButton').on('click', () => {
  stop = true;
  clearInterval(testId);
  clearInterval(getId);
});
