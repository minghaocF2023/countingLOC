import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import userFactory from '../src/models/userModel.js';
import PrivateMessageFactory from '../src/models/privateMessageModel.js';
import app from '../app.js';
import JWT from '../src/utils/jwt.js';

let mongoServer;
const port = 3000;
const url = `http://localhost:${port}`;
let server;
let User;
let mockTokenLeo;
let mockTokenLaura;
// let mockTokenUser3;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  // setup in-memory mongodb
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  if (mongoose.connection.readyState === 1) {
    console.log('connected');
  }
  server = app;
  const jwt = new JWT('Some secret keys');
  mockTokenLeo = jwt.generateToken('leo');
  mockTokenLaura = jwt.generateToken('laura');
  // mockTokenUser3 = jwt.generateToken('user3');
  if (mongoose.Connection.STATES.connected !== mongoose.connection.readyState) {
    throw new Error('Not connected to mongodb');
  }
  User = userFactory(mongoose);
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  const PrivateMessageModel = PrivateMessageFactory(mongoose.connection);

  // Create mock users
  const user1 = {
    username: 'leo',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
  };

  const user2 = {
    username: 'laura',
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
    content: 'Hello, laura!',
    senderName: 'leo',
    receiverName: 'laura',
    timestamp: Date.now(),
    status: 'OK',
    isViewed: false,
  });

  await privateMessage.save();
});

afterEach(async () => {
  try {
    await mongoose.connection.dropDatabase();
  } catch (error) {
    console.error('Error dropping database:', error);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

describe('Private Chat Integration Tests', () => {
  it('should retrieve the latest private messages between two users', async () => {
    const messageSent = 'Hello!';
    await axios.post(
      `${url}/messages/private`,
      { receiverName: 'laura', content: messageSent },
      {
        headers: { Authorization: `Bearer ${mockTokenLeo}` },
        params: {
          istest: 'true',
        },
      },

    ).then(() => {
      axios.get(`${url}/messages/private/leo/laura`, {
        params: { isInChat: true, istest: 'true' },
        headers: {
          Authorization: `Bearer ${mockTokenLeo}`,
          params: {
            istest: 'true',
          },
        },
      }).then((response) => {
        expect(response.status).toBe(200);
        // expect(response.data.messages.length).toBe(1);
        const msg = response.data.messages[0];
        expect(msg.senderName).toBe('leo');
        expect(msg.content).toBe(messageSent);
      });
    });
  });

  it('should post a new private message', async () => {
    const messageData = {
      content: 'how are you laura',
      receiverName: 'laura',
    };

    const response = await axios.post(`${url}/messages/private`, messageData, {
      headers: {
        Authorization: `Bearer ${mockTokenLaura}`,
      },
      params: {
        istest: 'true',
      },
    });

    expect(response.status).toBe(201);
  }, 10000);

  it('should get all users who have sent private messages to the user', async () => {
    /**
     * router.get('/:username/private', (req, res) => {
        privateChatController.getAllPrivate(req, res);
      });
     */
    const response = await axios.get(`${url}/users/laura/private`, {
      headers: {
        Authorization: `Bearer ${mockTokenLaura}`,
      },
      params: {
        istest: 'true',
      },
    });
    expect(response.status).toBe(200);
    console.log(response.data.users);
    expect(response.data.users.includes('leo')).toBe(true);
  }, 10000);
});
