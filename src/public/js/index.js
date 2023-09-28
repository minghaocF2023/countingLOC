/* eslint-disable no-console */
/* eslint-disable no-alert */
const registerButton = document.getElementById('register_button');
const addToDataBaseAfterValidation = (inputUsername, inputPassword) => {
  fetch('/api/users/register', {
    method: 'POST',
    body: JSON.stringify({
      username: inputUsername,
      password: inputPassword,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data.message);
      if (data.message === 'Registration success') {
        window.location.href = '/acknowledge';
      } else {
        alert('Registration failed! Please try again.');
      }
    });
};

if (registerButton) {
  registerButton.addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    if (inputUsername === '' || inputPassword === '') {
      alert('Please enter username and password');
      return;
    }
    fetch('/api/users/validate', {
      method: 'POST',
      body: JSON.stringify({
        username: inputUsername,
        password: inputPassword,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        if (data.message === 'Duplicated User') {
          alert('User Already Exists!');
          document.getElementById('username').value = '';
          document.getElementById('password').value = '';
        }
        if (data.message === 'Invalid Username') {
          alert('Invalid Username! Please change another one.');
          document.getElementById('username').value = '';
        }
        if (data.message === 'Invalid Password') {
          alert('Invalid Password! Please change another one.');
          document.getElementById('password').value = '';
        }
        // if (data.message === 'OK') {
        //   alert('Are you sure you want to join communinty?');
        //   addToDataBaseAfterValidation(inputUsername, inputPassword);
        // }
        if (data.message === 'OK') {
          if (window.confirm('Are you sure you want to join the community?')) {
            addToDataBaseAfterValidation(inputUsername, inputPassword);
          } else {
            // User pressed Cancel
            console.log('Registration was canceled by the user.');
          }
        }
      });
  });
}
