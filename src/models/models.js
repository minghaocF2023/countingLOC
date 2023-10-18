// import mongoose from 'mongoose';
// import mongooseReal from '../services/db.js';

// import userFactory from './userModel.js';
// import publicMessageFactory from './publicMessageModel.js';
// import { getTestState } from '../controllers/speedTestController.js';

// const DB_USERNAME = 'fse-dev';
// const DB_PASSWORD = 'fse-sb5-123';
// const DB_NAME = 'esndbtest';
// const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${DB_NAME}`;

// const createTestDatabaseConnection = () => {
//   mongoose.createConnection(uri, {
//     useNewURLParser: true,
//     useUnifiedTopology: true,
//   });
//   return mongoose;
// };

// const databaseIntance = getTestState ? createTestDatabaseConnection() : mongooseReal;

// const User = userFactory(mongooseReal);
// const PublicMessage = publicMessageFactory(mongooseReal);

// export { User, PublicMessage };

import { realConnection } from '../services/db.js';
import userFactory from './userModel.js';
import publicMessageFactory from './publicMessageModel.js';

// Factory functions to get models based on desired connection:
const createUserModel = (connection) => userFactory(connection);
const createPublicMessageModel = (connection) => publicMessageFactory(connection);

// Default Models for real database:
const User = createUserModel(realConnection);
const PublicMessage = createPublicMessageModel(realConnection);

export {
  User, PublicMessage, createUserModel, createPublicMessageModel,
};
