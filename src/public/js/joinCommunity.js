/* eslint-disable no-undef */
const connectSocket = (inputUsername) => {
  const socket = io();
  socket.emit('username', inputUsername);
};

const register = async (inputUsername, inputPassword) => {
  axios.post('/users', { username: inputUsername, password: inputPassword }).then((res) => console.log(res));
};

const login = async (inputUsername, inputPassword) => {
  axios.put(`/users/${inputUsername}/online`, { password: inputPassword }).then((res) => {
    console.log(res);
  });
};

const joinCommunity = async (inputUsername, inputPassword) => {
  axios.get(`/users/${username}`).then((res) => {
    if (res.data.message === 'User not found') {
      register(inputUsername, inputPassword);
    } else if (res.data.message === 'OK') {
      login(inputUsername, inputPassword);
    } else if (res.data.message === 'Banned username') {
      alert('Invalid Username');
    }
  });
  axios.put(`/users/${inputUsername}/online`, { password: inputPassword }).then((res) => {
    localStorage.setItem('token', res.data.token);
    connectSocket(inputUsername);
  }).catch((err) => {
    // if
    joinCommunity(inputUsername, inputPassword).then((res) => {
      console.log(res);
    });
  });
};

const registerButton = document.getElementById('register_button');
if (registerButton) {
  registerButton.addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    if (inputUsername === '' || inputPassword === '') {
      alert('Please enter username and password');
    }

    joinCommunity(inputUsername, inputPassword).then(() => {
      console.log('join Community');
    });
  });
}
