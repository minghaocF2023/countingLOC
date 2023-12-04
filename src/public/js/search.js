/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-alert */

let currentPageNum = 1;

const insertResult = (resultHTML, resultsContainer) => {
  // Change this to append if we want to add new results to the bottom
  resultsContainer.prepend(resultHTML);
  if (currentPageNum === 1) {
    resultsContainer.children().last()[0].scrollIntoView();
  } else {
    resultsContainer.children().first()[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const addMoreResultListener = (resultsContainer, searchContext) => {
  // Add an event listener for the "More Results" button
  resultsContainer.off('click', '#more-results').on('click', '#more-results', () => {
    currentPageNum += 1; // Increment the page number
    performSearch($('#search-content').val().trim(), searchContext, currentPageNum); // Perform search with the new page number
  });
};

const showNoResultFoundAlert = () => {
  iziToast.show({
    title: 'No results found',
    message: 'Please try a different query.',
    position: 'center',
    // onClosed() {
    // window.location.reload();
    // },
    buttons: [
      ['<button>Close</button>', function (instance, toast) {
        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
      }],
    ],
  });
};

const showInvalidStatusAlert = () => {
  iziToast.show({
    title: 'Invalid status',
    message: 'Please enter a valid status among OK, Help, Emergency.',
    position: 'center',
    buttons: [
      ['<button>Close</button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
      }],
    ],
  });
};

const showInvalidSearchTypeAlert = () => {
  iziToast.show({
    title: 'Invalid search type',
    message: 'Please select a search type before searching.',
    position: 'center',
    buttons: [
      ['<button>Close</button>', (instance, toast) => {
        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
      }],
    ],
  });
};

const compareByUsername = (a, b) => a.username.localeCompare(b.username);

const handleNoResultsOrFirstPage = (data, resultsContainer, currentPageNum) => {
  // Check if no results are found
  if (data.length === 0) {
    // Clear the results container if it's the first page
    if (currentPageNum === 1) {
      resultsContainer.empty();
    }
    // Display an alert to the user
    showNoResultFoundAlert();
    return true; // Return true to indicate no results were found
  }

  // If it's the first page, empty the container and append the "More Results" button
  if (currentPageNum === 1) {
    resultsContainer.empty();
    const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style="margin: 0 auto; display: block;">More Results</button>');
    resultsContainer.append(moreResultsButton);
  }

  return false; // Return false to indicate there are results and it's not the first page
};

const updatePublic = (searchContext, data) => {
  const resultsContainer = $('#chat-container');
  if (handleNoResultsOrFirstPage(data, resultsContainer, currentPageNum)) {
    return; // Exit the function if no results are found
  }
  // // If no results found
  // if (data.length === 0) {
  //   // Clear the results container
  //   if (currentPageNum === 1) {
  //     resultsContainer.empty();
  //   }
  //   // Display an alert to the user
  //   showNoResultFoundAlert();
  //   return;
  // }
  // // If it's the first page, empty the container
  // if (currentPageNum === 1) {
  //   resultsContainer.empty();
  //   const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style = "margin: 0 auto; display: block;">More Results</button>');
  //   resultsContainer.append(moreResultsButton);
  // }
  data.forEach((result) => {
    const resultHTML = createChatMessage(
      result.senderName,
      result.status,
      result.content,
      result.timestamp,
    );
    insertResult(resultHTML, resultsContainer);
  });
  addMoreResultListener(resultsContainer, searchContext);
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
  if (handleNoResultsOrFirstPage(data, resultsContainer, currentPageNum)) {
    return; // Exit the function if no results are found
  }
  // // If no results found
  // if (data.length === 0) {
  //   // Clear the results container
  //   if (currentPageNum === 1) {
  //     resultsContainer.empty();
  //   }
  //   // Display an alert to the user
  //   showNoResultFoundAlert();
  //   return;
  // }
  // // If it's the first page, empty the container
  // if (currentPageNum === 1) {
  //   resultsContainer.empty();
  //   const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style = "margin: 0 auto; display: block;">More Results</button>');
  //   resultsContainer.append(moreResultsButton);
  // }
  data.forEach((result) => {
    const resultHTML = createAnnouncementMessage(
      result.senderName,
      result.content,
      result.timestamp,
    );
    insertResult(resultHTML, resultsContainer);
  });
  addMoreResultListener(resultsContainer, searchContext);
};

const updatePrivate = (searchContext, data) => {
  const resultsContainer = $('#chat-list');
  if (data.length === 0) {
    // Clear the results container
    if (currentPageNum === 1) {
      resultsContainer.empty();
    }
    // Display an alert to the user
    showNoResultFoundAlert();
    return;
  }
  if (currentPageNum === 1) {
    resultsContainer.empty();
    const moreResultsButton = $('<button type="button" class="btn btn-primary" id="more-results" style = "margin: 0 auto; display: block;">More Results</button>');
    resultsContainer.append(moreResultsButton);
  }
  data.forEach((result) => {
    if (result.senderName === undefined) {
      result.senderName = '';
    }
    if (result.content === undefined) {
      result.content = '';
    }
    const resultHTML = createChatMessage(
      result.senderName,
      result.status,
      result.content,
      result.timestamp,
    );
    insertResult(resultHTML, resultsContainer);
  });
  addMoreResultListener(resultsContainer, searchContext);
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
  if (searchContext === 'private') {
    updatePrivate(searchContext, data);
  }
}

function performSearch(searchInput, searchContext, pageNum = 1) {
  // Construct the query parameters based on the context
  let queryParams = `context=${searchContext}&pageSize=10&pageNum=${pageNum}`;
  let searchedStatus = '';
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
        $('#online-user-list').empty();
        $('#offline-user-list').empty();
        showInvalidStatusAlert();
        return;
      }
    } else if ($('#search-content').data('search-type') === 'username') {
      queryParams += `&username=${encodeURIComponent(searchInput)}`;
    } else {
      $('#online-user-list').empty();
      $('#offline-user-list').empty();
      showInvalidSearchTypeAlert();
      return;
    }
  }
  if (searchContext === 'public' || searchContext === 'announcement') {
    queryParams += `&words=${encodeURIComponent(searchInput)}`;
  }
  if (searchContext === 'private') {
    queryParams += `&userA=${encodeURIComponent(window.location.search.split('=')[1])}&userB=${encodeURIComponent(localStorage.getItem('username'))}`;
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
  } else if (window.location.pathname.includes('/privateChat')) {
    searchContext = 'private';
  } else if (window.location.pathname.includes('/announcement')) {
    searchContext = 'announcement';
  }

  // Perform the search if there is input
  if (searchInput) {
    performSearch(searchInput, searchContext);
  }
});
