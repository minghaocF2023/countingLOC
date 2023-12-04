document.getElementById('shelterForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var shelterName = document.getElementById('name').value;
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;

    if (!isValidLatitude(latitude)) {
        iziToast.error({
            title: 'Error',
            message: 'Latitude must be a number between -90 and 90.',
            position: 'topCenter'
        });
        return;
    }

    if (!isValidLongitude(longitude)) {
        iziToast.error({
            title: 'Error',
            message: 'Longitude must be a number between -180 and 180.',
            position: 'topCenter'
        });
        return;
    }

    // Perform your save logic here -- save to database
    try {
        addShelter(shelterName, longitude, latitude); 
    } catch (e) {
        console.log(e);
    }
});

function isValidLatitude(lat) {
    return lat && !isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
    return lng && !isNaN(lng) && lng >= -180 && lng <= 180;
}

const addShelter = async (shelterName, longitude, latitude) => {
    try {
        console.log('trying to save shelter data.....');
        await axios.post('/shelters', { shelterName, longitude, latitude }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        iziToast.success({ title: 'Success', message: 'Shelter saved!', position: 'topCenter' });

        // redirect after short delay
        setTimeout(() => {
            window.history.back();
        }, 1000);
    } catch (error) {
        let errorMessage = 'Failed to save shelter information.';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        iziToast.error({ title: 'Error', message: errorMessage, position: 'topCenter' });
    }
};

$(window).on('load', () => {
  $('#search-icon').hide();
});
