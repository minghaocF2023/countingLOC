/* eslint-disable max-len */
/* eslint-disable no-undef */
const createChatMessage = (senderName, status, content, timestamp) => {
  let iconHTML = '';
  if (status === 'OK') {
    iconHTML += '<i class="fas fa-check-circle" style="color:green"></i>';
  }
  if (status === 'help') {
    iconHTML += '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>';
  }
  if (status === 'emergency') {
    iconHTML += '<i class="fas fa-exclamation-triangle" style="color:red"></i>';
  }
  let renderName = senderName;
  if (renderName === localStorage.getItem('username')) {
    renderName = 'Me';
  }
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${renderName}${iconHTML}</h5>`;
  code += `<span class="timestamp">${timestamp}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

$(window).on('load', () => {
  const mockUserJson = [
    {
      senderName: 'User1', status: 'OK', content: 'Hello World', timestamp: '17:00 PM, Oct 03, 2023',
    },
    {
      senderName: 'User2', status: 'emergency', content: 'Hello World', timestamp: '17:00 PM, Oct 03, 2023',
    }, {
      senderName: 'User3', status: 'help', content: 'Hello World', timestamp: '17:00 PM, Oct 03, 2023',
    }, {
      senderName: 'User4', status: undefined, content: 'Hello World', timestamp: '17:00 PM, Oct 03, 2023',
    },
  ];
  let list = '';

  mockUserJson.forEach((element) => {
    list += createChatMessage(element.senderName, element.status, element.content, element.timestamp);
  });

  $('#chat-list').html(list);
});
