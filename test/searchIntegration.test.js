import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken;
let mockToken2;
let mockUser;
let mockUser2;

beforeAll(async () => {
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

  mockUser2 = {
    username: 'laura_bot2',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  await axios.post(`${HOST}/users`, { username: mockUser.username, password: mockUser.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockUser2.username, password: mockUser2.password }, { params: { istest: 'true' } });
  await axios.post();

  mockToken = jwt.generateToken(mockUser.username);
  mockToken2 = jwt.generateToken(mockUser2.username);

  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser2.username }, params: { istest: 'true' } });
  // await axios.delete(`${HOST}/messages/announcement`, { data: { username: mockUser.username } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

// Query Type 1:
test('get announcement after search', async () => {
  const announcement = 'test this is a unique announcement';

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
  expect(getResponse.data[0].content).toBe('test this is a unique announcement');
});

// Query Type 2:
test('get empty announcement after search stop words', async () => {
  // retrieve the announcement
  const getResponse = await axios.get(`${HOST}/search?context=announcement&pageSize=10&pageNum=1&words=a`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.length).toBe(0);
});

// // Query Type 3:
// test('get users by status', async () => {
// //   const updateStatusResponse = await axios.post(`${HOST}/users/${mockUser2.username}/status/'Emergency'`, {}, {
// //     headers: { Authorization: `Bearer ${mockToken2}` },
// //     params: { istest: 'true' },
// //   });
// //   expect(updateStatusResponse.status).toBe(200);
// //   expect(updateStatusResponse.data.status).toBe('Emergency');
//   // retrieve the announcement
//   const getUserInfo = await axios.get(`${HOST}/search?context=user&pageSize=10&pageNum=1&status=OK`, {
//     params: { istest: 'true' },
//     headers: { Authorization: `Bearer ${mockToken}` },
//   });

//   expect(getUserInfo.status).toBe(200);
//   console.log(getUserInfo);
//   // expect(getUserInfo.data)
//   // expect(getUserInfo.data.length).toBe(0);
// }, 30000);
