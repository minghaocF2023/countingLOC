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
  // console.log(mockToken);

  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  // await axios.delete(`${HOST}/messages/announcement`, { data: { username: mockUser.username } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

// Query Type 1:
test('get latest announcement', async () => {
  const announcement = 'Latest Announcement';

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
  const getResponse = await axios.get(`${HOST}/messages/announcement`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.data[0].content).toBe('Latest Announcement');
}, 30000);

test('Post announcement', async () => {
  const data = {
    content: 'Another test announcement',
  };

  const response = await axios.post(`${HOST}/messages/announcement`, data, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
    params: {
      istest: 'true',
    },
  });

  expect(response.status).toBe(201);
  expect(response.data.data.content).toBe('Another test announcement');
}, 30000);
