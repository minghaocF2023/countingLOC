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

const createMedicineItem = (medicinename, quantity) => {
  let html = '';
  html += '<div class="card message-card">';
  html += '<div class="card-body">';
  html += `<h5 class="card-title">${medicinename}</h5>`;
  html += `<p class="card-text">Quantity: ${quantity}</p>`;
  html += '</div>';
  html += '</div>';
  return html;
};
window.createMedicineItem = createMedicineItem;

const createRequestItem = (id, medicinename, quantity, username, status, timestamp) => {
  const buttonsHtml = status === 'Waiting for Review'
    ? `<div class="mt-3">
         <button class="btn btn-success btn-approve" data-id="${id}">Approve</button>
         <button class="btn btn-danger btn-reject" data-id="${id}" style="margin-left: 1em">Reject</button>
       </div>`
    : `<div class="mt-3">
       </div>`;

  return `
    <div class="card message-card" data-id="${id}">
      <div class="card-body">
        <h5 class="card-title">${medicinename}-${username}</h5>
        <p class="card-text">Quantity: ${quantity}</p>
        <p class="card-text status-text">Status: ${status}</p>
        <span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>
        ${buttonsHtml}
      </div>
    </div>`;
};

window.createRequestItem = createRequestItem;

const createMyRequestItem = (id, medicinename, quantity, username, status, timestamp) => {
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${medicinename}-${username}</h5>`;
  code += `<p class="card-text">Quantity: ${quantity}</p>`;
  code += `<p class="card-text status-text">Status: ${status}</p>`;
  code += `<span class="timestamp">${new Date(timestamp).toLocaleString('en-US', { hour12: false })}</span>`;
  code += '</div>';
  code += '</div>';
  return code;
};

window.createMyRequestItem = createMyRequestItem;
