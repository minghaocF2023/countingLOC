/* eslint-disable no-undef */

/**
 * error notification
 */
const showError = (errorTitle, errorMessage) => {
  iziToast.warning({
    title: errorTitle,
    message: errorMessage,
    position: 'topRight',
  });
};

/**
 * success notification
 */
const showSuccess = (title, message) => {
  iziToast.success({
    title,
    message,
    position: 'topRight',
  });
};

/**
 * warning notification
 */
const showWarning = (title, message) => {
  iziToast.warning({
    title,
    message,
    position: 'topRight',
  });
};

const setupUserInfo = (res, inputUsername) => new Promise((resolve) => {
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('username', inputUsername);
  showSuccess('Login', 'Login Successful');
  resolve();
});
/**
 * user login
 */
const login = async (inputUsername, inputPassword, firstTime) => {
  axios.put(`/users/${inputUsername}/online`, { password: inputPassword }).then(async (res) => {
    await setupUserInfo(res, inputUsername);
    if (firstTime === true) {
      window.location.href = '/acknowledge';
    } else {
      window.location.href = '/esndirectory';
    }
  }).catch((err) => {
    if (err.response) {
      if (err.response.data.message === 'Incorrect username/password') {
        showError('Login failed', 'Incorrect username/password');
      }
    }
  });
};

const confirmRegister = () => new Promise((resolve, reject) => {
  iziToast.question({
    timeout: 20000,
    close: false,
    overlay: true,
    displayMode: 'once',
    id: 'question',
    zindex: 999,
    title: 'Confirm Join Community',
    message: 'Do you really want to join community?',
    position: 'center',
    buttons: [
      ['<button><b>YES</b></button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOut', onClosing: () => resolve() }, toast, 'button');
      }, true],
      ['<button>NO</button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOut', onClosing: () => reject() }, toast, 'button');
      }, false],
    ],
  });
});

/**
 * validate user registration info
 */
const userInfoValidation = (username, password) => {
  const USERNAME_RULE = /^\w[a-zA-Z0-9_-]{2,}$/;
  if (username.length < 3) {
    showError('Invalid Username', 'Username is too short!');
    return false;
  }
  if (!USERNAME_RULE.test(username)) {
    showError('Invalid Username', 'This username is invalid!');
    return false;
  }
  if (password.length < 4) {
    showError('Invalid Password', 'This password is too short');
    return false;
  }

  //   if (!window.confirm('Are you sure you want to join the community?')) {
  //     return false;
  //   }
  return true;
};

/**
 * user registration
 */
const register = async (inputUsername, inputPassword) => {
  if (userInfoValidation(inputUsername, inputPassword) === true) {
    confirmRegister().then(() => {
      axios.post('/users', { username: inputUsername, password: inputPassword }).then(() => {
        login(inputUsername, inputPassword, true);
      });
    }).catch(() => {
      showWarning('Registration Cancelled', 'You cancelled your registration!');
    });
  }
};

/**
 * submit user info form and will either login or create a new user
 */
const joinCommunity = async (inputUsername, inputPassword) => {
  axios.get(`/users/${inputUsername}`).then(() => {
    login(inputUsername, inputPassword);
  }).catch((err) => {
    if (err.response.data.message === 'User not found') {
      register(inputUsername, inputPassword);
    } else if (err.response.data.message === 'Banned username') {
      showError('Invalid username', 'This username is banned!');
    }
  });
};

// ================= DOM controll ========================
const registerButton = document.getElementById('register_button');
if (registerButton) {
  registerButton.addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    if (inputUsername === '' || inputPassword === '') {
      showError('Nothing Entered', 'Please enter username and password');
      return;
    }

    joinCommunity(inputUsername, inputPassword).then(() => {
      console.log('join Community');
    });
  });
}
