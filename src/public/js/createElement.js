/* eslint-disable no-underscore-dangle */
const STATUS = {
  OK: '<i class="fas fa-check-circle" style="color:green"></i>',
  Help: '<i class="fas fa-exclamation-circle" style="color:rgb(255, 230, 0)"></i>',
  Emergency: '<i class="fas fa-exclamation-triangle" style="color:red"></i>',
  undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
  Undefined: '<i class="fas fa-question-circle" style="color:gray"></i>',
};

window.STATUS = STATUS;

const timestampToTime = (timestamp) => new Date(timestamp).toLocaleString('en-US', { hour12: false });

const createChatMessage = (senderName, status, content, timestamp) => {
  const iconHTML = STATUS[status];
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title">${renderName} ${iconHTML}</h5>`;
  code += `<span class="timestamp">${timestampToTime(timestamp)}</span>`;
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

  const editButton = document.createElement('button');
  editButton.className = 'btn btn-primary btn-sm';
  editButton.textContent = 'Edit';
  editButton.style.color = 'white';
  editButton.onclick = (event) => {
    event.stopPropagation(); // Prevents the card's onclick event
    $('#userEditModalLabel').text(`Edit Profile for ${username}`);
    $('#editUserForm #username').val(username);
    // TODO: Fetch and set the current user's account status and privilege level
    // $('#editUserForm #accountStatus').val(currentUserAccountStatus);
    // $('#editUserForm #privilegeLevel').val(currentUserPrivilegeLevel);
    $('#userEditModal').modal('show');
  };

  // Append the edit button to the user card
  div.querySelector('.card-body').appendChild(editButton);
  return div;
};

window.createUserBlock = createUserBlock;

const createAnnouncementMessage = (senderName, content, timestamp) => {
  const renderName = senderName === localStorage.getItem('username') ? 'Me' : senderName;
  let code = '';
  code += '<div class="card message-card">';
  code += '<div class="card-body">';
  code += `<h5 class="card-title flex-grow-1">${renderName}</h5>`;
  code += `<span class="timestamp">${timestampToTime(timestamp)}</span>`;
  code += `<p class="card-text">${content}</p>`;
  code += '</div>';
  code += '</div>';
  return code;
};

window.createAnnouncementMessage = createAnnouncementMessage;

const createMedicineItem = (medicinename, quantity) => {
  let html = '';
  html += `<div class="card message-card" data-medicinename="${medicinename}">`;
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
  const deleteButtonHtml = status === 'Waiting for Review'
    ? `<div class="mt-3">
         <button class="btn btn-primary text-white btn-delete" data-id="${id}">Delete</button>
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
        ${deleteButtonHtml}
      </div>
    </div>`;
};

window.createMyRequestItem = createMyRequestItem;
const createEmergencyEventBlock = (event) => {
  const div = document.createElement('div');
  div.className = 'card mb-3 event-card';
  div.innerHTML = '<div class="card-body">'
      + '<div class="d-flex justify-content-between align-items-center">'
      + `<h5 class="card-title d-inline-block">${event.title}`
      + `<a class="edit-button" data-id="${event._id}"><i class="bi bi-pencil-square"></i></a> `
      + `<span class="badge text-bg-danger severity">Severity ${event.severity}</span></h5>`
      + `<span class="timestamp d-inline-block">${timestampToTime(event.timestamp)}</span>`
      + '</div>'
      + `<p class="card-text location"><span class="card-label">Location: </span>${event.location}</p>`
      + `<p class="card-text range"><span class="card-label">Range: </span>${event.range_affected}</p>`
      + `<p class="card-text description"><span class="card-label">Description: </span>${event.description}</p>`
      + '</div>'
      + '</div>';
  return div;
};

window.createEmergencyEventBlock = createEmergencyEventBlock;
const createPill = (content) => `<span class="badge me-2 rounded-pill text-bg-primary text-white">${content}</span>`;
window.createPill = createPill;
