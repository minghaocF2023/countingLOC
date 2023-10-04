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

router.get('/esndirectory', (req, res) => {
  res.render('esndirectory');
});

router.get('/chatwall', (req, res) => {
  res.render('chatwall');
});
export default router;
