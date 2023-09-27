const express = require('express');

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

module.exports = router;
