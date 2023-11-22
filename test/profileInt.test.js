import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken1;
let mockToken2;
let mockToken3;
let mockToken4;
let mockUser1;
let mockUser2;
let mockUser3;
let mockUser4;
let mockProfile;

beforeAll(async () => {
  User = userFactory(mongoose);

  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  mockUser1 = {
    username: 'user1',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  mockUser2 = {
    username: 'user2',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };
  mockUser3 = {
    username: 'user3',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  mockUser4 = {
    username: 'user4',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  mockProfile = {
    firstName: 'Fake',
    lastName: 'Leo',
    profileImage: 'upload/leo_photo',
    pronoun: 'He/His',
    birthdate: '2023-11-22T00:00:00.000Z',
    phone: '0001011010',
    email: 'leo000111444@gmail.com',
    doctorID: '655b155b126e64f2950dd678',
    doctorEmail: 'leo000111444@gmail.com',
    drugAllergy: [
      'FSE',
      'ibuprofen',
    ],
    healthCondition: [
      'bad',
    ],
  };

  await axios.post(`${HOST}/users`, { username: mockUser1.username, password: mockUser1.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockUser2.username, password: mockUser1.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockUser3.username, password: mockUser1.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockUser4.username, password: mockUser1.password }, { params: { istest: 'true' } });
  mockToken1 = jwt.generateToken(mockUser1.username);
  mockToken2 = jwt.generateToken(mockUser2.username);
  mockToken3 = jwt.generateToken(mockUser3.username);
  mockToken4 = jwt.generateToken(mockUser4.username);
  server = app;
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser1.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser2.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser3.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser4.username }, params: { istest: 'true' } });
  await axios.delete(
    `${HOST}/profile/`,
    {
      headers: { Authorization: `Bearer ${mockToken1}` },
      params: { istest: 'true' },
    },
  );
  await axios.delete(
    `${HOST}/profile/`,
    {
      headers: { Authorization: `Bearer ${mockToken2}` },
      params: { istest: 'true' },
    },
  ); await axios.delete(
    `${HOST}/profile/`,
    {
      headers: { Authorization: `Bearer ${mockToken3}` },
      params: { istest: 'true' },
    },
  ); await axios.delete(
    `${HOST}/profile/`,
    {
      headers: { Authorization: `Bearer ${mockToken4}` },
      params: { istest: 'true' },
    },
  );
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

describe('Private Chat Integration Tests', () => {
  // Query Type 1:

  it('should successfully post new profile', async () => {
    const postResponse = await axios.post(
      `${HOST}/profile/`,
      { profile: mockProfile },
      {
        headers: { Authorization: `Bearer ${mockToken1}` },
        params: { istest: 'true' },
      },
    );
    expect(postResponse.status).toBe(201);
  });

  it('should successfully get new profile', async () => {
    const postResponse = await axios.post(
      `${HOST}/profile/`,
      { profile: mockProfile },
      {
        headers: { Authorization: `Bearer ${mockToken2}` },
        params: { istest: 'true' },
      },
    );
    expect(postResponse.status).toBe(201);
    const getResponse = await axios.get(
      `${HOST}/profile/`,
      {
        headers: { Authorization: `Bearer ${mockToken2}` },
        params: { istest: 'true' },
      },
    );
    expect(getResponse.status).toBe(200);
  });

  it('should successfully delete new profile', async () => {
    axios.post(
      `${HOST}/profile/`,
      { profile: mockProfile },
      {
        headers: { Authorization: `Bearer ${mockToken3}` },
        params: { istest: 'true' },
      },
    ).then(async () => {
      const getResponse = await axios.delete(
        `${HOST}/profile/`,
        {
          headers: { Authorization: `Bearer ${mockToken3}` },
          params: { istest: 'true' },
        },
      );
      expect(getResponse.status).toBe(201);
    });
  }, 20000);

  it('should successfully delete new profile', async () => {
    axios.post(
      `${HOST}/profile/`,
      { profile: mockProfile },
      {
        headers: { Authorization: `Bearer ${mockToken3}` },
        params: { istest: 'true' },
      },
    ).then(async () => {
      const getResponse = await axios.put(
        `${HOST}/profile/`,
        { profile: mockProfile },
        {
          headers: { Authorization: `Bearer ${mockToken3}` },
          params: { istest: 'true' },
        },
      );
      expect(getResponse.status).toBe(201);
    });
  }, 20000);

  it('should successfully view other profile', async () => {
    axios.post(
      `${HOST}/profile/`,
      { profile: mockProfile },
      {
        headers: { Authorization: `Bearer ${mockToken4}` },
        params: { istest: 'true' },
      },
    ).then(async () => {
      const getResponse = await axios.get(
        `${HOST}/profile/${mockUser4.username}`,
        {
          headers: { Authorization: `Bearer ${mockToken3}` },
          params: { istest: 'true' },
        },
      );
      expect(getResponse.status).toBe(200);
    });
  }, 20000);
});
