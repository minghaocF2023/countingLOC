/* eslint-disable no-undef */
const editUserProfile = () => {
  const currentUser = $('#hidden-username').val();
  const userProfile = {
    isActive: $('#accountStatus').val() === 'active',
    privilege: $('#privilegeLevel').val(),
    username: $('#editUserForm #username').val(),
    password: $('#password').val() === '' ? undefined : $('#password').val(),
  };
  // TODO: API verify information to be valid

  axios.put(`/admin/profile/${currentUser}`, userProfile, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then(() => {
    showSuccess('Success', 'User profile updated.');
    $('#userEditModal').modal('hide');
    $('#password').val('');
  }).catch((err) => {
    $('#userEditModal').modal('show');
    showWarning('Error', err.response.data.message);
    $('#password').val('');
  });

  return false;
};

$('#saveChanges').on('click', () => {
  editUserProfile();
  window.location.reload();
});
