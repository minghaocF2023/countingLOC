/* eslint-disable no-alert */
const registerButton = document.getElementById('register_button');
if (registerButton) {
  registerButton.addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    if (inputUsername === '' || inputPassword === '') {
      alert('Please enter username and password');
      return;
    }
    fetch('/register', {
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
        if (data.message === 'OK') {
          console.log('OK');
        } else {
          alert(data.message);
        }
      });
  });
}
