/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const userLogout = async (username) => {
  axios.put(`/users/${username}/offline`).then(() => {
    console.log('offline');
  });
};

$('#logout').on('click', async () => {
  await userLogout(localStorage.getItem('username')).then(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href('join');
  });
});

// close tab
window.onbeforeunload = () => {
  userLogout(localStorage.getItem('username'));
};
