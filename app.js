/* eslint-disable no-console */
const express = require('express');
const path = require('path');

const indexRouter = require('./src/routes/indexRouter');
const userRouter = require('./src/routes/userRouter');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('src/public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(indexRouter);
app.use(userRouter);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server started on port 3000');
});
