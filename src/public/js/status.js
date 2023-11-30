/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const setStatus = async (status) => {
  await axios.post(
    `users/${localStorage.getItem('username')}/status/${status}`,
    null,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  ).then(async (res) => {
    const currentStatus = res.data.status;
    if (currentStatus === 'Emergency') {
      axios.post(
        'mail',
        null,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
      ).then(() => {
        console.log('Hi');
        showWarning('Emergency email sent', 'An email is sent to your emergency contact.');
      }).catch(() => {
        showWarning('Emergency Email Fail', 'Fail to send an emergency email, please check your profile settings');
      });
    }
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

const getStatus = async (username = null) => axios.get(
  `users/${username || localStorage.getItem('username')}/status`,
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

window.STATUS = STATUS;
window.setStatus = setStatus;
window.setStatusIcon = setStatusIcon;
window.getStatus = getStatus;
