// import mongoose from 'mongoose';

// const DB_USERNAME = 'fse-dev';
// const DB_PASSWORD = 'fse-sb5-123';
// const DB_NAME = 'esndb';
// const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${DB_NAME}`;

// // mongoose.connect(uri, {
// //   useNewURLParser: true,
// //   useUnifiedTopology: true,
// // });
// mongoose.createConnection(uri, {
//   useNewURLParser: true,
//   useUnifiedTopology: true,
// });

// export default mongoose;

import mongoose from 'mongoose';

const DB_USERNAME = 'fse-dev';
const DB_PASSWORD = 'fse-sb5-123';

// Real database connection
const REAL_DB_NAME = 'esndb';
const realUri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${REAL_DB_NAME}`;
const realConnection = mongoose.createConnection(realUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test database connection
const TEST_DB_NAME = 'esndbtest';
const testUri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${TEST_DB_NAME}`;
const testConnection = mongoose.createConnection(testUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export { realConnection, testConnection };
