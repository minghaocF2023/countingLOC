const STATUS = {
  OK: '<i class="fas fa-check-circle" style="color:green"></i>',
  Help: '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>',
  Emergency: '<i class="fas fa-exclamation-triangle" style="color:red"></i>',
  undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
  Undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
};

window.STATUS = STATUS;

const createChatMessage = (senderName, status, content, timestamp) => {
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

window.createChatMessage = createChatMessage;

const createUserBlock = (username, onlineStatus, emergencyStatus, profileImage, isContact) => {
  const onlineStatusStr = onlineStatus ? 'online' : 'offline';
  const div = document.createElement('div');
  div.id = username;
  div.className = 'card mb-3 user-card';

  let content = profileImage ? '<div class="card-body d-flex align-items-center">'
      + `<div><img class="me-2" style="height: 4rem; aspect-ratio: 1 / 1;" src="${profileImage}"></div>`
      + '<div style="flex: 1">'
      + `<h5 class="card-title">${username} ${STATUS[emergencyStatus]}</h5>`
      + `<p class="card-text"><span class="status ${onlineStatusStr}">${onlineStatusStr}</span></p>`
      + '</div>' : '<div class="card-body">'
      + `<h5 class="card-title">${username} ${STATUS[emergencyStatus]}</h5>`
      + `<p class="card-text"><span class="status ${onlineStatusStr}">${onlineStatusStr}</span></p>`;
  content += isContact ? `<a href="/contact?user=${username}"><i style="font-size: 2rem;" class="bi bi-person-circle"></i></a></div></div>` : '</div></div>';
  div.innerHTML = content;
  div.onclick = () => {
    window.location.href = `/privateChat?username=${username}`;
  };
  return div;
};

window.createUserBlock = createUserBlock;

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

window.createAnnouncementMessage = createAnnouncementMessage;

const createPill = (content) => `<span class="badge me-2 rounded-pill text-bg-primary text-white">${content}</span>`;
window.createPill = createPill;
