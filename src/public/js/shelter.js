const MAP_API_KEY = "AIzaSyD0qtJZZIfYUhKekvB5e37oD2Ri5n4AgqI";

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

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            // const shelterLocation1 = {
            //     lat: position.coords.latitude + 0.1,
            //     lng: position.coords.longitude - 0.1,
            // }
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12,
                center: userLocation
            });
            var marker = new google.maps.Marker({
                position: userLocation,
                map: map,
                title: 'Your Location',
            });
            
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