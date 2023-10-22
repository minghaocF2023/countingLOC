/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const STATUS = {
  OK: '<i class="fas fa-check-circle" style="color:green"></i>',
  Help: '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>',
  Emergency: '<i class="fas fa-exclamation-triangle" style="color:red"></i>',
  undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
  Undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
};

const setStatus = async (status) => {
  await axios.post(
    `users/${localStorage.getItem('username')}/status/${status}`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then((res) => {
    // console.log(res.data);
  }).catch((err) => {
    console.warn(err.response.data);
    // if navigate to chat wall without token, should back to join page
    if (err.response.data.message === 'Unauthorized Request') {
      window.location = '/join';
    }
  });
};

const setStatusIcon = (status) => {
  $('#username+span.dropdown>.dropdown-toggle').html(STATUS[status]);
};

const getStatus = async () => axios.get(
  `users/${localStorage.getItem('username')}/status`,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
).then(
  (res) => res.data.status,
).catch((err) => {
  console.warn(err.response.data);
});

const userStatus = await getStatus();
if (userStatus !== undefined) {
  $('#username').text(localStorage.getItem('username'));
  setStatusIcon(userStatus);
  $('li.nav-item.d-none').removeClass('d-none');
}

Object.keys(STATUS).forEach((key) => {
  $(`#${key}`).on('click', () => {
    setStatus(key);
    setStatusIcon(key);
  });
});

export default STATUS;
export { setStatus, setStatusIcon, getStatus };
