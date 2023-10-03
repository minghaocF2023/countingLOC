import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/join', (req, res) => {
  res.render('register');
});

router.get('/acknowledge', (req, res) => {
  res.render('acknowledge');
});

router.get('/chat/public', (req, res) => {
  res.render('chat/public');
});

router.get('/esndirectory', (req, res) => {
  res.render('esndirectory');
});

export default router;
