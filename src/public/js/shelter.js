let userLocation;

function requestUserLocation() {
    iziToast.question({
        timeout: 20000,
        close: false,
        overlay: true,
        displayMode: 'once',
        id: 'question',
        zindex: 999,
        title: 'Request Location',
        message: 'Would you like to share your GPS location?',
        position: 'center',
        buttons: [
            ['<button><b>Yes</b></button>', function (instance, toast) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                initMap();
            }, true],
            ['<button>No</button>', function (instance, toast) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                window.history.back();
            }],
        ],
    });
}

function calculateEuclideanDistance(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
}

const allShelters = async () => axios.get(
    `/shelters`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
);

async function fetchShelters() {
    try {
        const res = await axios.get(
            '/shelters', 
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
        );
        console.log('printing res data...:' + res.data.data);
        return res.data.data;
    } catch(e) {
        console.error('Error fetching shelters:', error);
        return [];
    }
}

function displayClosestShelters(shelters, map) {
    const distances = shelters.map(shelter => ({
        ...shelter,
        distance: calculateEuclideanDistance(
            userLocation.lat, userLocation.lng,
            parseFloat(shelter.latitude), parseFloat(shelter.longitude)
        )
    }));

    const closestShelters = distances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

    closestShelters.forEach(shelter => {
        const lat = parseFloat(shelter.latitude);
        const lng = parseFloat(shelter.longitude);
        // Only create a marker if both latitude and longitude are valid numbers
        if (!isNaN(lat) && !isNaN(lng)) {
            var marker = new google.maps.Marker({
                position: { lat, lng },
                map: map,
                title: shelter.shelterName,
                icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/library_maps.png"
            });

            marker.addListener('click', () => {
                // Redirect to the shelter info page
                window.location.href = `/shelters/${shelter._id}/info`; 
            });
        }
    });
}

async function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            document.getElementById('userLatitude').textContent = userLocation.lat.toFixed(6);
            document.getElementById('userLongitude').textContent = userLocation.lng.toFixed(6);
            
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: userLocation
            });
            var marker = new google.maps.Marker({
                position: userLocation, 
                map: map,
                title: 'Your Location',
            });
            
            console.log('fetching shelters...');
            const shelters = await fetchShelters();
            displayClosestShelters(shelters, map);

        }, function() {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

// Call the function to show the notification when the window loads
if (window.onload) {
    requestUserLocation();
} else {
    window.onload = requestUserLocation;
}