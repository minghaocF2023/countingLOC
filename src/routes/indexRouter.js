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

router.get('/doctorIdentification', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'doctorIdentification');
});

router.get('/doctorAppointment', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'doctorAppointment');
});

router.get('/patientAppointment', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'patientAppointment');
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

router.get('/announcement', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'announcement');
});

router.get('/emergencies', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'emergencyEvents');
});

router.get('/userprofile', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'profile');
});
router.get('/contact', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'contactProfile');
});

router.get('/editprofile', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'profileEdit');
});

router.get('/503page', (req, res) => {
  res.render('503page');
});

router.get('/shelter', (req, res) => {
  res.render('shelter');
});

router.get('/addShelter', (req, res) => {
  res.render('addShelter');
});

router.get('/market', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'marketmedicine');
});

router.get('/request/', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'requestwall');
});

router.get('/makerequest', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'makerequest');
});

router.get('/myrequest', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'myrequest');
});

router.get('/requestConfirmation', (req, res) => {
  res.render(global.isTest === true ? '503page' : 'requestConfirmation');
});

// router.get('/messages/public', (req, res) => {
//   res.render('chatwall');
// });

export default router;
