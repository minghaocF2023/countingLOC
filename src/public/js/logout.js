/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const userLogout = (username) => {
  localStorage.removeItem('token');
  localStorage.remoteItem('username');
  axios.put(`/users/${username}/offline`).then((res) => {
    console.log(res);
  });
  console.log('offline');
};

$('#logout').on('click', () => {
  console.log('logout');
  userLogout(localStorage.getItem('username'));
});

// close tab
window.onbeforeunload = () => {
  userLogout(localStorage.getItem('username'));
};
