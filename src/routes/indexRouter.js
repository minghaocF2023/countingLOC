import express from 'express';
import speedTestController from '../controllers/speedTestController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render(speedTestController.getTestState() ? '503page' : 'home');
});

router.get('/join', (req, res) => {
  res.render(speedTestController.getTestState() ? '503page' : 'register');
});

router.get('/acknowledge', (req, res) => {
  res.render(speedTestController.getTestState() ? '503page' : 'acknowledge');
});

router.get('/esndirectory', (req, res) => {
  res.render(speedTestController.getTestState() ? '503page' : 'esndirectory');
});

router.get('/chatwall', (req, res) => {
  res.render(speedTestController.getTestState() ? '503page' : 'chatwall');
});

router.get('/privatechat', (req, res) => {
  res.render('privateChat');
});

router.get('/privatechat', (req, res) => {
  res.render('privateChat');
});

// router.get('/messages/public', (req, res) => {
//   res.render('chatwall');
// });

export default router;
