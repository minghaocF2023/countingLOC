import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import medicineFactory from '../src/models/medicineModel.js';
import requestFactory from '../src/models/requestModel.js';
import JWT from '../src/utils/jwt.js';
import userFactory from '../src/models/userModel.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let Request;
let Medicine;
let mockRequest;
let mockToken;
let mockUser;

beforeAll(async () => {
  User = userFactory(mongoose);
  Medicine = medicineFactory(mongoose);
  Request = requestFactory(mongoose);

  // Create a user in MongoDB
  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  mockUser = {
    username: 'testuser',
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

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(() => {
    // console.log('stop database');
    server.close();
  });
});

// 3. Non-query: post a new request
test('Post a new request', async () => {
  const data = {
    medicinename: 'test medicine',
    quantity: 10,
    username: mockUser.username,
    status: 'Waiting for Review',
    timestamp: Date.now(),
  };

  const postResponse = await axios.post(
    `${HOST}/requests`,
    data,
    {
      headers: { Authorization: `Bearer ${mockToken}` },
      params: { istest: 'true' },
    },
  );

  // Verify the medicine was added successfully
  expect(postResponse.status).toBe(201);
  // expect(postResponse.data.data.medicinename).toBe('Test Medicine');
}, 5000);

// 4. Query: get requests
test('Get all requests', async () => {
  const getResponse = await axios.get(`${HOST}/requests`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.data[0].medicinename).toBe('test medicine');
}, 5000);

// 5. Query: get one user's requests
test('Get one user requests', async () => {
  const getResponse = await axios.get(`${HOST}/requests/testuser`, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });
  // console.log(getResponse);

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.data.length).toBe(1);
}, 5000);

test('Update status of a request', async () => {
  const response = await axios.get(`${HOST}/requests`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });
  // eslint-disable-next-line no-underscore-dangle
  const requestId = response.data.data[0]._id;
  const updateData = { status: 'Rejected' };

  const getResponse = await axios.put(`${HOST}/requests/${requestId}`, updateData, {
    headers: { Authorization: `Bearer ${mockToken}` },
    params: { istest: 'true' },
  });

  expect(getResponse.data.request.status).toBe('Rejected');
}, 30000);
