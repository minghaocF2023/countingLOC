import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import medicineFactory from '../src/models/medicineModel.js';
import JWT from '../src/utils/jwt.js';
import userFactory from '../src/models/userModel.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let Medicine;
let mockMedicine;
let mockToken;
let mockUser;

beforeAll(async () => {
  User = userFactory(mongoose);
  Medicine = medicineFactory(mongoose);

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

  mockMedicine = {
    medicinename: 'Mock Medicine',
    quantity: '500',
  };

  server = app;
});

afterEach(async () => {
  // await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(async () => {
    // console.log('stop database');
    await server.close();
  });
});

// 1. Non-query: donate a new medicine
test('Donate a new medicine', async () => {
  const medicineData = {
    medicinename: 'test medicine',
    quantity: 50,
  };

  const postResponse = await axios.post(
    `${HOST}/market/medicines`,
    medicineData,
    {
      headers: { Authorization: `Bearer ${mockToken}` },
      params: { istest: 'true' },
    },
  );

  // Verify the medicine was added successfully
  expect(postResponse.status).toBe(201);
  expect(postResponse.data.data.medicinename).toBe('Test Medicine');
});

// 2. Query type
test('Get all medicines', async () => {
  const getResponse = await axios.get(`${HOST}/market/medicines`, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken}` },
  });

  expect(getResponse.status).toBe(200);
  expect(getResponse.data.data[0].medicinename).toBe('Test Medicine');
});
