import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';
import { setTestMode } from '../src/utils/testMode.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken;
let mockUser;

beforeAll(async () => {
  setTestMode(true);
  User = userFactory(mongoose);

  // Create a user in MongoDB
  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  mockUser = {
    username: 'ever',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  await axios.post(`${HOST}/users`, { username: mockUser.username, password: mockUser.password }, { params: { istest: 'true' } });

  mockToken = jwt.generateToken(mockUser.username);
  // console.log(mockToken);

  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

test('Fetch user status successfully', async () => {
  const testUser = mockUser.username;
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
});

test('Update user status', async () => {
  const testUser = mockUser.username;
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
});
