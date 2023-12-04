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
  localStorage.setItem('role', res.data.privilege);
  localStorage.setItem('username', inputUsername.toLowerCase());
  localStorage.setItem('isDoctor', res.data.isDoctor || false);
  showSuccess('Login', 'Login Successful');
  setTimeout(() => { resolve(); }, 700);
});
/**
 * user login
 */
const login = async (inputUsername, inputPassword, firstTime) => {
  axios.post(`/users/${inputUsername}`, { password: inputPassword }).then(async (res) => {
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
      if (err.response.data.message === 'User is not active') {
        showError('Inactive Account', 'Your account is not active yet!');
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
const roleForm = document.getElementById('roleForm');
const roleSelect = document.getElementById('role');

const addDoctorIdentity = (username) => {
  axios.post(`/users/${username}/adddoctoridentity`)
    .then(() => {
      window.location.href = '/editprofile'; // Redirect to the desired page on success
    })
    .catch((error) => {
      console.error('Error setting user as doctor:', error);
    });
};
if (roleForm) {
  roleForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission
    const isDoctor = roleSelect.value === 'yes';
    const inputUsername = localStorage.getItem('username');
    if (isDoctor) {
      addDoctorIdentity(inputUsername);
    } else {
      window.location.href = '/editprofile';
    }
  });
}

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

// if (localStorage.getItem('token')) {
//   window.location = 'esndirectory';
// }

$(window).on('load', () => {
  localStorage.removeItem('token');
  localStorage.setItem('username', '');
});
