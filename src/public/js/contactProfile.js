/* eslint-disable no-undef */
const getProfile = async () => {
  const queries = new URLSearchParams(window.location.search);
  const contact = queries.get('user');
  console.log(contact);
  const profile = await axios.get(`/profile/${contact}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  console.log(`profile:${profile.data}`);

  return profile.data;
};

const setProfileData = (data) => {
  $('#titlePrimary').text(`${data.firstName} ${data.lastName}`);
  $('#titleSecondary').text(`#${localStorage.getItem('username')} · ${data.pronoun}`);
  $('#birthdate').text(data.birthdate.split('T')[0]);
  $('#phone').text(data.phone);
  $('#mail').text(data.email);
  console.log(data.profileImage);
  $('#imgArea').attr('src', data.profileImage);
  $('#docMail').text(data.doctorEmail);

  data.drugAllergy.forEach((e) => {
    $('#allergy').append(createPill(e));
  });
  data.healthCondition.forEach((e) => {
    $('#health').append(createPill(e));
  });
};

$(window).on('load', async () => {
  getProfile().then((res) => {
    setProfileData(res.profile);
  }).catch(() => {
    showWarning('Error', 'Cannot find your profile...');
    $('#noProfile').removeClass('d-none');
    $('#profile').addClass('d-none');
  });
});
