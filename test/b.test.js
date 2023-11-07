import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';
import { testConnection } from '../src/services/db.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken;
let mockUser;
let mockUser2;

beforeAll(async () => {
  User = userFactory(testConnection);

  // Create a user in MongoDB
  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  mockUser = {
    username: 'laura_bot',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  await axios.post(`${HOST}/users`, { username: mockUser.username, password: mockUser.password }, { params: { istest: 'true' } });
  mockToken = jwt.generateToken(mockUser.username);

  const password2 = await User.hashPassword('password2', salt);
  mockUser2 = {
    username: 'laura_test',
    password2,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  await axios.post(`${HOST}/users`, { username: mockUser2.username, password: mockUser2.password2 }, { params: { istest: 'true' } });
  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser2.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

// Query Type 1:
test('get latest announcement', async () => {
  const announcement = 'this is a unique Announcement';

  // send the message
  const postResponse = await axios.post(
    `${HOST}/messages/announcement`,
    { content: announcement },
    {
      headers: { Authorization: `Bearer ${mockToken}` },
      params: { istest: 'true' },
    },
  );

  // ensure the message was successfully sent before proceeding
  expect(postResponse.status).toBe(201);

  // retrieve the announcement
  const getResponse = await axios.get(`${HOST}/search?context=announcement&pageSize=10&pageNum=1&words=unique`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data[0].content).toBe('this is a unique Announcement');
}, 30000);

// Query type 2:
test('return no announcement with stop words ', async () => {
  // retrieve the announcement
  const getResponse = await axios.get(`${HOST}/search?context=announcement&pageSize=10&pageNum=1&words=a`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.length).toBe(0);
}, 30000);

// Query type 3:
test('return user by searching username', async () => {
  // retrieve the announcement
  const getResponse = await axios.get(`${HOST}/search?context=user&pageSize=10&pageNum=1&username=laura`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.length).toBe(2);
}, 30000);
