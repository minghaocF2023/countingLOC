/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */

const checkAllInput = () => {
  const form = $('#profile');
  if (!form.get(0).checkValidity()) {
    form.addClass('was-validated');
    return false;
  }
  return true;
};

const postNewProfile = async () => {
  if (!checkAllInput()) {
    console.log('hello');
    return;
  }
  const firstName = $('#firstName').val();
  const lastName = $('#lastName').val();
  const pronoun = $('#pronoun').val();
  const birthdate = $('#birthdate').val();
  const phone = $('#phone').val();
  const doctorID = $('#emergency').children(':selected').attr('id');
  const email = $('#mail').val();
  const docMail = $('#docEmail').val();
  const imgName = $('#imgName').text();

  const profileImage = imgName === '' ? 'images/ambulance.png' : `upload/${imgName}`;
  const healthCondition = [];
  const drugAllergy = [];

  $('#allergyArea').children().each((index, element) => {
    console.log(element);
    drugAllergy.push($(element).text());
  });

  $('#healthArea').children().each((index, element) => {
    healthCondition.push($(element).text());
  });

  const data = {
    firstName,
    lastName,
    pronoun,
    birthdate,
    phone,
    email,
    doctorID,
    doctorEmail: docMail,
    profileImage,
    healthCondition,
    drugAllergy,
  };
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('edit')) {
    await axios.put('/profile', { profile: data }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    window.location = '/userprofile';
  } else {
    await axios.post('/profile', { profile: data }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    window.location = '/userprofile';
  }
};

const deleteProfile = async () => {
  await axios.delete('/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
};

const setUserProfile = async () => {
  axios.get('/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    const { profile } = res.data;
    $('#firstName').val(profile.firstName);
    $('#lastName').val(profile.lastName);
    $('#pronoun').val(profile.pronoun);
    $('#birthdate').val(profile.birthdate.split('T')[0]);
    $('#phone').val(profile.phone);
    $('#mail').val(profile.email);
    // console.log(profile.profileImage.split('/').pop());
    const img = profile.profileImage;
    const profileName = profile.profileImage.split('/').pop();
    $('#imgName').text(profileName);
    $('#imageArea').attr('src', img);
    $('#docEmail').val(profile.doctorEmail);
    if (profile.doctorID) {
      $('#default').removeAttr('selected');
      $(`#${profile.doctorID}`).attr('selected', 'selected');
    }
    profile.drugAllergy.forEach((e) => {
      $('#allergyArea').append(createPill(e));
    });
    profile.healthCondition.forEach((e) => {
      $('#healthArea').append(createPill(e));
    });
  });
};

$('#update').on('click', async () => {
  // Format the plain form data as JSON
  await postNewProfile();
});

$('#delete').on('click', async () => {
  // Format the plain form data as JSON
  await deleteProfile();
  window.location = '/userprofile';
});

$('#allergyAdd').on('click', (e) => {
  e.preventDefault();
  const val = $('#allergy').val();

  if (val) {
    $('#allergyArea').append(createPill(val));
  }
  $('#allergy').val('');
});

$('#healthBtn').on('click', (e) => {
  e.preventDefault();
  const val = $('#health').val();

  if (val) {
    $('#healthArea').append(createPill(val));
  }
  $('#health').val('');
});

$('#back').on('click', async () => {
  // Format the plain form data as JSON
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('edit')) {
    window.location = '/userprofile';
  } else {
    window.location = '/esndirectory';
  }
});

const setDoctorList = async () => {
  axios.get('/users/doctors', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  }).then((res) => {
    const list = res.data.doctorList;
    list.forEach((user) => {
      if (user.username !== localStorage.getItem('username')) {
        const listItem = `<option id="${user._id}" value="${user.email}">${user.username}</option>`;
        $('#emergency').append(listItem);
      }
    });

    $('#emergency').append('<option id="other" value="">Other</option>');
  });
};

$(window).on('load', async () => {
  $('#search-icon').hide();
  const urlParams = new URLSearchParams(window.location.search);
  setDoctorList().then(async () => {
    if (urlParams.has('edit')) {
      await setUserProfile();
    }
  });
});

$('#emergency').on('change', () => {
  const currentDocEmail = $('#emergency').val();
  $('#docEmail').val(currentDocEmail);
});
const uploadImage = async () => {
  const file = $('#profileImg').prop('files')[0];
  const fileName = `${localStorage.getItem('username')}_photo`;
  const formData = new FormData();
  formData.append('image', file, fileName);
  axios.post('/files/upload', formData, {
    headers: {
      'content-type': 'multipart/form-data', // do not forget this
    },
  }).then(() => {
    showSuccess('Success', 'Image Uploaded');
    $('#imgName').text(fileName);
  });
};
$('#uploadImg').on('click', async () => {
  $('#profileImg').trigger('click');
});

$('#profileImg').on('change', async () => {
  const file = $('#profileImg').prop('files') ? $('#profileImg').prop('files')[0] : null;

  if (file) {
    const url = URL.createObjectURL(file);
    $('#imageArea').attr('src', url);
    await uploadImage();
  }
});
