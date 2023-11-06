/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-alert */

let currentPageNum = 1;

const createChatMessage = (senderName, status, content, timestamp) => {
  const STATUS = {
    OK: '<i class="fas fa-check-circle" style="color:green"></i>',
    Help: '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>',
    Emergency: '<i class="fas fa-exclamation-triangle" style="color:red"></i>',
    Undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
    undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
  };
  const iconHTML = STATUS[status];
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${renderName} ${iconHTML}</h5>`;
  code += `<span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

function updateUI(searchContext, data) {
  if (searchContext === 'public') {
    const resultsContainer = $('#chat-container');
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
  }
}

function performSearch(searchInput, searchContext, pageNum = 1) {
  // Construct the query parameters based on the context
  let queryParams = `context=${searchContext}&pageSize=10&pageNum=${pageNum}`;
  if (searchContext === 'user') {
    queryParams += `&username=${encodeURIComponent(searchInput)}`;
  } else {
    queryParams += `&words=${encodeURIComponent(searchInput)}`;
  }

  // Make an AJAX call to the backend
  $.ajax({
    url: `/search?${queryParams}`,
    method: 'GET',
    dataType: 'json',
    success(data) {
      console.log('Searched successfully');
      if (data.length === 0) {
        alert('No results found');
      } else {
        updateUI(searchContext, data);
      }
    },
    error(jqXHR, textStatus, errorThrown) {
      console.error('Error:', errorThrown);
    },
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
    console.log('chat wall');
    searchContext = 'public';
  } else if (window.location.pathname.includes('/privatechat')) {
    searchContext = 'private';
  } else if (window.location.pathname.includes('/announcement')) {
    searchContext = 'announcement';
  } else if (window.location.pathname.includes('/speedtest')) {
    // console.log('speed test');
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
