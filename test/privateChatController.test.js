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
let mockToken1;
let mockToken2;
let mockUser1;
let mockUser2;

beforeAll(async () => {
  setTestMode(true);
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

  await axios.post(`${HOST}/users`, { username: mockUser1.username, password: mockUser1.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockUser2.username, password: mockUser1.password }, { params: { istest: 'true' } });
  mockToken1 = jwt.generateToken(mockUser1.username);
  mockToken2 = jwt.generateToken(mockUser2.username);

  server = app;
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockUser1.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser2.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/messages/private`, { data: { senderName: mockUser1.username, receiverName: mockUser2.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/admin/chatroom`, { data: { senderName: mockUser1.username, receiverName: mockUser2.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

describe('Private Chat Integration Tests', () => {
  // Query Type 1:
  it('should retrieve the latest private messages between two users', async () => {
    const messageSent = 'Hello!';

    // send the message
    const postResponse = await axios.post(
      `${HOST}/messages/private`,
      { receiverName: mockUser2.username, content: messageSent },
      {
        headers: { Authorization: `Bearer ${mockToken1}` },
        params: { istest: 'true' },
      },
    );

    // ensure the message was successfully sent before proceeding
    expect(postResponse.status).toBe(201);

    // retrieve the message
    const getResponse = await axios.get(`${HOST}/messages/private/user1/user2`, {
      params: { isInChat: true, istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(getResponse.status).toBe(200);
    const msg = getResponse.data.data[0];
    expect(msg.senderName).toBe('user1');
    expect(msg.content).toBe(messageSent);
  });

  // Query Type 2:
  it('should get all users who have chatted with user 2', async () => {
    const messageSent = 'Hello!';

    // send the message
    const postResponse = await axios.post(
      `${HOST}/messages/private`,
      { receiverName: mockUser2.username, content: messageSent },
      {
        headers: { Authorization: `Bearer ${mockToken1}` },
        params: { istest: 'true' },
      },
    );

    // message successfully sent
    expect(postResponse.status).toBe(201);
    // get resonse
    const response = await axios.get(`${HOST}/users/user1/private`, {
      headers: {
        Authorization: `Bearer ${mockToken1}`,
      },
      params: {
        istest: 'true',
      },
    });
    expect(response.status).toBe(200);
    expect(response.data.users).toContain('user2');
  });

  // State-Updating 1:
  it('should post a new private message', async () => {
    const messageData = {
      content: 'How ru',
      receiverName: 'user2',
    };

    const response = await axios.post(`${HOST}/messages/private`, messageData, {
      headers: {
        Authorization: `Bearer ${mockToken1}`,
      },
      params: {
        istest: 'true',
      },
    });

    expect(response.status).toBe(201);
    expect(response.data.data.receiverName).toBe('user2');
    expect(response.data.data.content).toBe(messageData.content);
  }, 20000);
});
