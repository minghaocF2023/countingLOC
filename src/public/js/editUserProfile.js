/* eslint-disable no-undef */

const editUserProfile = () => {
  const currentUser = $('#hidden-username').val();
  const userProfile = {
    isActive: $('#accountStatus').val() === 'active',
    privilege: $('#privilegeLevel').val(),
    username: $('#editUserForm #username').val(),
    password: $('#password').val() === '' ? null : $('#password').val(),
  };
  // TODO: API verify information to be valid

  axios.put(`/admin/profile/${currentUser}`, userProfile, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    console.log(res);
  });
};

$('#saveChanges').on('click', () => {
  editUserProfile();
});
