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

const notify = (msg) => {
  const { senderName } = msg.content;
  showInfo(
    'New message',
    `You have a new message from ${senderName}`,
    `/privateChat?username=${senderName}`,
  );
};

window.notify = notify;
