import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'home');
});

router.get('/join', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'register');
});

router.get('/acknowledge', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'acknowledge');
});

router.get('/esndirectory', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'esndirectory');
});

router.get('/chatwall', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'chatwall');
});

router.get('/privatechat', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'privatechat');
});

router.get('/speedtest', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'speedtest');
});

// router.get('/messages/public', (req, res) => {
//   res.render('chatwall');
// });

export default router;
