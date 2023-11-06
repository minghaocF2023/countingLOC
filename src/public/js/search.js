function updateUI(searchContext, data) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (searchContext === 'public') {
        
    }
}

function performSearch(searchInput, searchContext) {
    // Construct the query parameters based on the context
    let queryParams = `context=${searchContext}&pageSize=10&pageNum=1`;
    if (searchContext === 'user') {
        queryParams += `&username=${encodeURIComponent(searchInput)}`;
    } else {
        queryParams += `&words=${encodeURIComponent(searchInput)}`;
    }

    // Make an AJAX call to the backend
    fetch(`/search?${queryParams}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            updateUI(searchContext, data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Attach event listener to the search button
document.getElementById('search-button').addEventListener('click', () => {
    const searchInput = document.querySelector('.input-group input[type="text"]').value.trim();

    // Determine the search context based on the current page
    let searchContext;
    if (window.location.pathname.includes('/esndirectory')) {
        searchContext = 'user';
    } else if (window.location.pathname.includes('/chatwall')) {
        searchContext = 'public';
    } else if (window.location.pathname.includes('/privatechat')) {
        searchContext = 'private';
    } // Add other contexts as needed

    // Perform the search if there is input
    if (searchInput) {
        performSearch(searchInput, searchContext);
    }
});
