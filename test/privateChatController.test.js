import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import userFactory from '../src/models/userModel.js';
import privateMessageFactory from '../src/models/privateMessageModel.js';
import app from '../app.js'; // Import your express app
import JWT from '../src/utils/jwt.js';

let mongod;
const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let PrivateMessageModel;

let mockTokenA;
let mockTokenB;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  console.log(`&&&${uri}`);

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  User = userFactory(mongoose);
  PrivateMessageModel = privateMessageFactory(mongoose);

  server = app;

  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);

  mockTokenA = jwt.generateToken('userA');
  mockTokenB = jwt.generateToken('userB');

  // new PrivateMessageModel = PrivateMessageFactory(mongoose.connection);

  // Create mock users
  const user1 = {
    username: 'userA',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  const user2 = {
    username: 'userB',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'OK',
    statusTimestamp: new Date(),
  };

  await User.create(user1);
  await User.create(user2);

  // Create mock private messages
  const privateMessage = new PrivateMessageModel({
    chatroomId: new mongoose.Types.ObjectId(),
    content: 'Hello, userB!',
    senderName: 'userA',
    receiverName: 'userB',
    timestamp: Date.now(),
    status: 'OK',
    isViewed: false,
  });

  // await privateMessage.save();
  await PrivateMessageModel.create(privateMessage);
});

afterEach((done) => {
  mongoose.connection.dropDatabase().then(() => {
    done();
  });
});

afterAll(async () => {
  // mongoose.connection.close();
  // mongod.stop();
  // server.close();
  await mongoose.disconnect();
  // await mongoose.connection.close();
  await mongod.stop();
  server.close();
});

describe('Private Chat Integration Tests', () => {
  // it('should retrieve the latest private messages between two users', async () => {
  //   const messageSent = 'Hello!';
  //   axios.post(
  //     `${HOST}/messages/private`,
  //     { receiverName: 'laura', content: messageSent },
  //     { headers: { Authorization: `Bearer ${mockTokenLeo}` } },
  //   ).then(async () => {
  //     axios.get(`${HOST}/messages/private/leo/laura`, {
  //       params: { isInChat: true },
  //       headers: { Authorization: `Bearer ${mockTokenLeo}` },
  //     }).then(async (response) => {
  //       expect(response.status).toBe(200);
  //       console.log(`-------${response.data.messages}`);
  //       expect(response.data.messages.length).toBe(1);
  //       const msg = response.data.messages[0];
  //       expect(msg.senderName).toBe('leo');
  //       expect(msg.content).toBe(messageSent);
  //     });
  //   });
  // });
  it('should retrieve the latest private messages between two users', async () => {
    const messageSent = 'Hello!';
    await axios.post(
      `${HOST}/messages/private`,
      { content: messageSent, receiverName: 'userB' },
      { headers: { Authorization: `Bearer ${mockTokenA}` } },
    );

    const response = await axios.get(`${HOST}/messages/private/userA/userB`, {
      params: { isInChat: true },
      headers: { Authorization: `Bearer ${mockTokenA}` },
    });

    console.log(response.data); // Print the entire response data

    expect(response.status).toBe(200);

    if (response.data && response.data.messages) { // Add null and undefined check
      console.log(response.data.messages);
      expect(response.data.messages.length).toBe(1);
      const msg = response.data.messages[0];
      expect(msg.senderName).toBe('userA');
      expect(msg.content).toBe(messageSent);
    } else {
      throw new Error('Messages are undefined');
    }
  });

  it('should post a new private message', async () => {
    const messageData = {
      content: 'how are you laura',
      receiverName: 'userB',
    };

    const response = await axios.post(`${HOST}/messages/private`, messageData, {
      headers: {
        Authorization: `Bearer ${mockTokenB}`,
      },
    });

    expect(response.status).toBe(201);
  }, 10000);
});
