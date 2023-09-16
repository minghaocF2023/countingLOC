const mongoose = require('mongoose');

const DB_USERNAME = 'fse-dev';
const DB_PASSWORD = 'fse-sb5-123';
const DB_NAME = 'esndb';
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${DB_NAME}`;

mongoose.connect(uri, {
  useNewURLParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose

