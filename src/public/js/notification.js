/* eslint-disable no-undef */
const showInfo = (errorTitle, errorMessage, link) => {
  iziToast.info({
    title: errorTitle,
    message: errorMessage,
    position: 'topRight',
    buttons: [
      ['<button>View</button>', () => {
        window.location = link;
      }],
    ],
  });
};

const showWarning = (errorTitle, errorMessage) => {
  iziToast.warning({
    title: errorTitle,
    message: errorMessage,
    color: 'red',
    position: 'topRight',
  });
};

const showSuccess = (title, message) => {
  iziToast.success({
    title,
    message,
    position: 'topRight',
  });
};

const notify = (msg) => {
  const { senderName } = msg.content;
  showInfo(
    'New message',
    `You have a new message from ${senderName}`,
    `/privateChat?username=${senderName}`,
  );
};

const notifyAnnouncement = () => {
  iziToast.info({
    title: 'New announcement',
    message: 'Click to view ->',
    position: 'topRight',
    buttons: [
      ['<button>View</button>', () => {
        window.location = '/announcement';
      }],
    ],
  });
};

const alertMsgDuringOffline = (user) => {
  showInfo(
    'New message',
    `You have a new message from ${user} during offline`,
    `/privateChat?username=${user}`,
  );
};

const getChattedUsers = async () => axios.get(
  `/users/${localStorage.getItem('username')}/private`,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
).then((res) => {
  const { users } = res.data;
  return users;
});

const hasUnreadMsg = async (user) => axios.get(
  `/messages/private/${user}/${localStorage.getItem('username')}?isInChat=false`,
  { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
).then((res) => {
  const { messageToBeNotified } = res.data;
  return messageToBeNotified;
});

window.notify = notify;
window.getChattedUsers = getChattedUsers;
window.notifyAnnouncement = notifyAnnouncement;
window.showWarning = showWarning;
window.showSuccess = showSuccess;
(await getChattedUsers()).forEach(async (user) => {
  if (await hasUnreadMsg(user)) {
    alertMsgDuringOffline(user);
  }
});
