/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const userLogout = (username) => {
  axios.put(`/users/${username}/offline`).then((res) => {
    console.log(res);
  });
};
