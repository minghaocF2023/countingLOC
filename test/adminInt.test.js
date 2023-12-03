import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import JWT from '../src/utils/jwt.js';
import userFactory from '../src/models/userModel.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken;
let mockUser;

beforeAll(async () => {
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
    isActive: true,
    privilege: 'Administrator',
  };

  await axios.post(`${HOST}/users`, { username: mockUser.username, password: mockUser.password }, { params: { istest: 'true' } });

  mockToken = jwt.generateToken(mockUser.username);
  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: 'everNew' }, params: { istest: 'true' } });
  await mongoose.disconnect().then(async () => {
    // console.log('stop database');
    await server.close();
  });
});

test('Should successfully update the isActive status of a user profile', async () => {
  const updateData = {
    isActive: false,
  };

  const response = await axios.put(`${HOST}/admin/profile/${mockUser.username}`, updateData, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('User profile successfully updated');
});

test('Should successfully update the privilege of a user profile', async () => {
  const updateData = {
    privilege: 'Citizen',
  };

  const response = await axios.put(`${HOST}/admin/profile/${mockUser.username}`, updateData, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('User profile successfully updated');
});

test('Should successfully update the password of a user profile', async () => {
  const updateData = {
    password: '1234',
  };

  const response = await axios.put(`${HOST}/admin/profile/${mockUser.username}`, updateData, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('User profile successfully updated');
});

test('Should successfully update the username of a user profile', async () => {
  const updateData = {
    username: 'everNew',
  };

  const response = await axios.put(`${HOST}/admin/profile/${mockUser.username}`, updateData, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('User profile successfully updated');
});
