import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';
import { setTestMode } from '../src/utils/testMode.js';

let mongod;
const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken;
const TEST_DB_URI = 'mongodb://localhost/esndbtest';

beforeAll(async () => {
  setTestMode(true);

  try {
    await mongoose.connect(TEST_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to the database successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }

  User = userFactory(mongoose);

  const jwt = new JWT('Some secret keys');

  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);

  const mockUser = {
    username: 'never',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  await User.create(mockUser);
  mockToken = jwt.generateToken('never');
  console.log(mockToken);

  server = app;
});

afterEach((done) => {
  mongoose.connection.dropDatabase().then(() => {
    done();
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
});

test('Fetch user status successfully', async () => {
  const testUser = 'never';
  const response = await axios.get(`${HOST}/users/${testUser}/status`, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
    params: {
      istest: 'true',
    },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('OK');
  // Add additional assertions as needed
});

test('Update user status', async () => {
  const testUser = 'never';
  const newStatus = 'Emergency';

  const response = await axios.post(`${HOST}/users/${testUser}/status/${newStatus}`, null, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
    params: {
      istest: 'true',
    },
  });

  expect(response.status).toBe(200);
  expect(response.data.status).toBe(newStatus);
  // Add additional assertions as needed
});
