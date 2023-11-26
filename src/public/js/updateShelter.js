// updateShelter.js
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('shelterEditForm');
    const shelterNameDisplay = document.querySelector('h1'); // Assuming the first h1 tag contains the shelter name
    const latitudeDisplay = document.getElementById('latitudeDisplay'); // Make sure to add this ID in your HTML
    const longitudeDisplay = document.getElementById('longitudeDisplay'); // Make sure to add this ID in your HTML

    const deleteButton = document.getElementById('deleteButton');

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const shelterId = editForm.action.split('/').pop();
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        console.log('updating shelter info...');

        axios.put(`/shelters/${shelterId}`, data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Include if using token-based authentication
            }
        })
        .then(response => {
            if (response.data.success) {
                alert('Shelter updated successfully');
                
                // Update the page content
                shelterNameDisplay.textContent = 'Shelter Information - ' + data.shelterName;
                latitudeDisplay.textContent = 'Latitude: ' + data.latitude;
                longitudeDisplay.textContent = 'Longitude: ' + data.longitude;
            } else {
                alert('Error updating shelter');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating shelter');
        });
    });

    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            const shelterId = deleteButton.getAttribute('data-shelter-id');
            if(confirm('Are you sure you want to delete this shelter?')) {
                axios.delete(`/shelters/${shelterId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include if using token-based authentication
                    }
                })
                .then(response => {
                    if(response.data.success) {
                        alert('Shelter deleted successfully');
                        window.history.back(); // Redirect as needed
                    } else {
                        alert('Error deleting shelter');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error deleting shelter');
                });
            }
        });
    }
});
