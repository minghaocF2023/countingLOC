import mongoose from 'mongoose';
import mongooseReal from '../services/db.js';

import userFactory from './userModel.js';
import publicMessageFactory from './publicMessageModel.js';
import { getTestState } from '../controllers/speedTestController.js';

const DB_USERNAME = 'fse-dev';
const DB_PASSWORD = 'fse-sb5-123';
const DB_NAME = 'esndbtest';
const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@emergencysocialnetworkd.sycllnj.mongodb.net/${DB_NAME}`;

const createTestDatabaseConnection = () => {
  mongoose.createConnection(uri, {
    useNewURLParser: true,
    useUnifiedTopology: true,
  });
  return mongoose;
};

const databaseIntance = getTestState ? createTestDatabaseConnection() : mongooseReal;

const User = userFactory(mongooseReal);
const PublicMessage = publicMessageFactory(databaseIntance);

export { User, PublicMessage };
