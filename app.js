/* eslint-disable no-console */
const express = require('express');
const path = require('path');

const userRouter = require('./src/routes/userRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('src/public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(userRouter);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on port 3000');
});

// Yuke: feel free to change this route handler for the root path (/)
app.get('/', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log(req.body);
  res.json({ message: 'OK' });
  console.log(`req.body.username: ${req.body.username}`);
  console.log(`req.body.password: ${req.body.password}`);
});
