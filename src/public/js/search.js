/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-alert */

let currentPageNum = 1;

const showNoResultFoundAlert = () => {
  iziToast.show({
    title: 'No results found',
    message: 'Please try a different query.',
    position: 'center',
    onClosed() {
      window.location.reload();
    },
    buttons: [
      ['<button>Close</button>', function (instance, toast) {
        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
        window.location.reload();
      }]],
  });
};

const compareByUsername = (a, b) => a.username.localeCompare(b.username);

const createUserBlock = (username, onlineStatus, emergencyStatus) => {
  const onlineStatusStr = onlineStatus ? 'online' : 'offline';
  const div = document.createElement('div');
  div.id = username;
  div.className = 'card mb-3 user-card';
  div.innerHTML = '<div class="card-body">'
      + `<h5 class="card-title">${username} ${STATUS[emergencyStatus]}</h5>`
      + `<p class="card-text"><span class="status ${onlineStatusStr}">${onlineStatusStr}</span></p>`
      + '</div>'
      + '</div>';
  div.onclick = () => {
    window.location.href = `/privateChat?username=${username}`;
  };
  return div;
};

const createAnnouncementMessage = (senderName, content, timestamp) => {
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title flex-grow-1">${renderName}</h5>`;
  code += `<span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

const updatePublic = (searchContext, data) => {
  const resultsContainer = $('#chat-container');
  // If no results found
  if (data.length === 0) {
    // Clear the results container
    resultsContainer.empty();
    // Display an alert to the user
    showNoResultFoundAlert();
    return;
  }
  // If it's the first page, empty the container
  if (currentPageNum === 1) {
    resultsContainer.empty();
    const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style = "margin: 0 auto; display: block;">More Results</button>');
    resultsContainer.append(moreResultsButton);
  }
  data.forEach((result) => {
    const resultHTML = createChatMessage(
      result.senderName,
      result.status,
      result.content,
      result.timestamp,
    );
    // Change this to append if we want to add new results to the bottom
    resultsContainer.prepend(resultHTML);
    if (currentPageNum === 1) {
      resultsContainer.children().last()[0].scrollIntoView();
    } else {
      resultsContainer.children().first()[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  // Add an event listener for the "More Results" button
  resultsContainer.off('click', '#more-results').on('click', '#more-results', () => {
    currentPageNum += 1; // Increment the page number
    performSearch($('#search-content').val().trim(), searchContext, currentPageNum); // Perform search with the new page number
  });
};

const updateUser = (searchContext, data) => {
  $('#online-user-list').empty();
  $('#offline-user-list').empty();
  // If no results found
  if (data.length === 0) {
    // Display an alert to the user
    showNoResultFoundAlert();
    return;
  }
  const userOnlineStatus = data.sort(compareByUsername);
  const onlineList = [];
  const offlineList = [];
  userOnlineStatus.forEach((user) => {
    if (user.isOnline) {
      onlineList.push(createUserBlock(user.username, user.isOnline, user.status));
    } else {
      offlineList.push(createUserBlock(user.username, user.isOnline, user.status));
    }
  });
  $('#online-user-list').append(onlineList);
  $('#offline-user-list').append(offlineList);
};

const updateAnnouncement = (searchContext, data) => {
  const resultsContainer = $('#chat-container');
  // If no results found
  if (data.length === 0) {
    // Clear the results container
    resultsContainer.empty();

    // Display an alert to the user
    showNoResultFoundAlert();
    return;
  }
  // If it's the first page, empty the container
  if (currentPageNum === 1) {
    resultsContainer.empty();
    const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style = "margin: 0 auto; display: block;">More Results</button>');
    resultsContainer.append(moreResultsButton);
  }
  data.forEach((result) => {
    const resultHTML = createAnnouncementMessage(
      result.senderName,
      result.content,
      result.timestamp,
    );
    // Change this to append if we want to add new results to the bottom
    resultsContainer.prepend(resultHTML);
    if (currentPageNum === 1) {
      resultsContainer.children().last()[0].scrollIntoView();
    } else {
      resultsContainer.children().first()[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  // Add an event listener for the "More Results" button
  resultsContainer.off('click', '#more-results').on('click', '#more-results', () => {
    currentPageNum += 1; // Increment the page number
    performSearch($('#search-content').val().trim(), searchContext, currentPageNum); // Perform search with the new page number
  });
};

function updateUI(searchContext, data) {
  if (searchContext === 'public') {
    updatePublic(searchContext, data);
  }
  if (searchContext === 'user') {
    updateUser(searchContext, data);
  }
  if (searchContext === 'announcement') {
    updateAnnouncement(searchContext, data);
  }
}

function performSearch(searchInput, searchContext, pageNum = 1) {
  // Construct the query parameters based on the context
  let queryParams = `context=${searchContext}&pageSize=10&pageNum=${pageNum}`;
  let searchedStatus = '';
  console.log(queryParams);
  if (searchContext === 'user') {
    if ($('#search-content').data('search-type') === 'status') {
      if (searchInput.toLowerCase() === 'ok') {
        searchedStatus = 'OK';
        queryParams += `&status=${encodeURIComponent(searchedStatus)}`;
      } else if (searchInput.toLowerCase() === 'help') {
        searchedStatus = 'Help';
        queryParams += `&status=${encodeURIComponent(searchedStatus)}`;
      } else if (searchInput.toLowerCase() === 'emergency') {
        searchedStatus = 'Emergency';
        queryParams += `&status=${encodeURIComponent(searchedStatus)}`;
      } else {
        alert('Invalid status');
      }
    } else if ($('#search-content').data('search-type') === 'username') {
      queryParams += `&username=${encodeURIComponent(searchInput)}`;
    } else {
    // add alert title
      alert('Invalid search type. Please select if you would like to search for users or status before searching.');
    }
  }
  if (searchContext === 'public' || searchContext === 'announcement') {
    queryParams += `&words=${encodeURIComponent(searchInput)}`;
  }
  console.log(queryParams);
  // Make an AJAX call to the backend
  $.ajax({
    url: `/search?${queryParams}`,
    method: 'GET',
    dataType: 'json',
    success(data) {
      console.log('Searched successfully');
      console.log(data);
      updateUI(searchContext, data);
    },
    error(jqXHR, textStatus, errorThrown) {
      console.error('Error:', errorThrown);
    },
  });
}

// Only append the dropdown when the page is `/esndirectory`
if (window.location.pathname.includes('/esndirectory')) {
  const searchOptionsHTML = `
    <div class="input-group-append" id="search-by-group">
      <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="search-by-button">Search By</button>
      <div class="dropdown-menu">
        <a class="dropdown-item" href="#" data-search-type="username">Username</a>
        <a class="dropdown-item" href="#" data-search-type="status">Status</a>
      </div>
    </div>`;
  $('#search-content').after(searchOptionsHTML);

  // Fix the event delegation here
  $(document).on('click', '.dropdown-item', function () {
    const searchType = $(this).data('search-type');
    $('#search-content').attr('placeholder', `Search by ${searchType}...`);
    $('#search-by-button').text(`Search By: ${searchType.charAt(0).toUpperCase() + searchType.slice(1)}`);
    $('#search-content').data('search-type', searchType); // Store the current search type
  });
}

// Attach event listener to the search button
$('#search-button').on('click', () => {
  const searchInput = $('#search-content').val().trim();
  console.log(searchInput);
  // Determine the search context based on the current page
  let searchContext;
  console.log(window.location.pathname);
  currentPageNum = 1;
  if (window.location.pathname.includes('/esndirectory')) {
    searchContext = 'user';
  } else if (window.location.pathname.includes('/chatwall')) {
    searchContext = 'public';
  } else if (window.location.pathname.includes('/privatechat')) {
    searchContext = 'private';
  } else if (window.location.pathname.includes('/announcement')) {
    console.log('announcement searching');
    searchContext = 'announcement';
  } else if (window.location.pathname.includes('/speedtest')) {
    const resultsContainer = $('#search-content');
    resultsContainer.val('');
    alert('Cannot search in speed test');
    return;
  }

  // Perform the search if there is input
  if (searchInput) {
    performSearch(searchInput, searchContext);
  }
});
