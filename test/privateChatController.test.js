import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import app from '../app.js';
import {
  createUserModel, createPublicMessageModel, createPrivateMessageModel, createChatroomModel,
} from '../src/models/models.js';

let mongod;
const PORT = 3000;
const HOST = `http://localhost:${PORT}`;

let server;

beforeAll(async () => {
  server = app;
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const client = new mongoose.mongo.MongoClient(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
  );
  await client.connect();
  const User = createUserModel(client);
  await User.create([
    {
      username: 'alice',
      password: 'passwordForAlice',
      salt: 'randomSalt1',
      isOnline: false,
      status: 'OK',
      statusTimestamp: new Date(),
      chatrooms: ['chatroom1Id', 'chatroom2Id'],
    },
    {
      username: 'bob',
      password: 'passwordForBob',
      salt: 'randomSalt2',
      isOnline: true,
      status: 'Busy',
      statusTimestamp: new Date(),
      chatrooms: ['chatroom1Id'],
    },
  ]);
  // const db = client.db(await mongod.getDbName());
  // const usersCollection = db.collection('users');
  // await usersCollection.insertMany([
  //   {
  //     username: 'laura',
  //     password: '1Lx/QVILgewLzDXIqEHhPV4QaFd17JPOLcAwrUlvu1I=',
  //     salt: '0FGO+omn90n25YG9i2QRDA==',
  //     __v: 53,
  //     isOnline: false,
  //     statusTimestamp: {
  //       $date: '2023-10-22T17:29:15.032Z',
  //     },
  //     chatrooms: [
  //       {
  //         $oid: '652e2e6e56ba26faf1227a9b',
  //       },
  //       {
  //         $oid: '652e2f1d56ba26faf1227aa9',
  //       },
  //     ],
  //     status: 'Emergency',
  //   },
  //   {
  //     username: 'leo',
  //     password: 'hE8Ybe5ZITcFO9Rqr5bvwJpbcuTQ6veHaZuVDmQwqUE=',
  //     salt: '6SyEFGea1GxqojfP82BC9Q==',
  //     __v: 96,
  //     isOnline: false,
  //     chatrooms: [
  //       {
  //         $oid: '652e2e6e56ba26faf1227a9b',
  //       },
  //       {
  //         $oid: '65356d7daafe46f9eb09eba5',
  //       },
  //     ],
  //     status: 'OK',
  //     statusTimestamp: {
  //       $date: '2023-10-22T19:05:35.368Z',
  //     },
  //   },
  // ]);
  if (server && server.listening) {
    await server.close();
  }
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
  if (server && server.listening) {
    await server.close();
  }
});

// Query-type test 1: get all private chat users
test('Get all private chat users', async () => {
  const testUser = 'leo';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlbyIsImlhdCI6MTY5Nzk5Mzg5NX0.ez2Jzh97hTCwLi14FW1m8QM1FQkUiI6OmhY10r5Hybs';
  const response = await axios.get(`${HOST}/users/${testUser}/private`, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
  });
  const expectResponse = {
    users: [
      'laura',
    ],
  };
  expect(response.status).toBe(200);
  expect(response).toBe(expectResponse);
});

// Query-type test 2: get latest private message between two users
test('Get latest private message between two users', async () => {
  const testUser = 'leo';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlbyIsImlhdCI6MTY5Nzk5Mzg5NX0.ez2Jzh97hTCwLi14FW1m8QM1FQkUiI6OmhY10r5Hybs';
  const response = await axios.get(`${HOST}/users/${testUser}/private`, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
  });
  const expectResponse = {
    users: [
      'jerr',
      'laura',
    ],
  };
  expect(response.status).toBe(200);
  expect(response).toBe(expectResponse);
});

// State-updating test: Updating a user's status
test('Update user status', async () => {
  const testUser = 'leo';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxlbyIsImlhdCI6MTY5Nzk5Mzg5NX0.ez2Jzh97hTCwLi14FW1m8QM1FQkUiI6OmhY10r5Hybs';
  const newStatus = 'OK'; // The new status you want to set

  const response = await axios.post(`${HOST}/users/${testUser}/status/${newStatus}`, null, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
    timeout: 10000,
  });

  expect(response.status).toBe(200);
  // expect(response.data.message).toBe('Status updated successfully!');
  expect(response.data.status).toBe(newStatus);
});

// import privateChatController from '../src/controllers/privateChatController.js';
// import { PrivateMessage } from '../src/models/models.js';
// // import JWT from '../src/utils/jwt.js';

// jest.mock('../src/models/models.js', () => ({
//   PrivateMessage: {
//     save: jest.fn(),
//     get: jest.fn(),
//     markedAsViewed: jest.fn(),
//   },
// }));

// describe('getLatestMessageBetweenUsers', () => {
//   const mockRequest = (params, query) => ({
//     params,
//     query,
//   });

//   const mockResponse = () => {
//     const res = {};
//     res.status = jest.fn().mockReturnValue(res);
//     res.json = jest.fn().mockReturnValue(res);
//     return res;
//   };

//   it('returns messages between users', async () => {
//     const req = mockRequest({ userA: 'Alice', userB: 'Bob' }, { isInChat: 'true' });
//     const res = mockResponse();

//     // Mock the returned messages from the database
//     PrivateMessage.get.mockResolvedValue([
//       {
//         getChatroomID: jest.fn().mockReturnValue('1'),
//         getText: jest.fn().mockReturnValue('Hello'),
//         getSenderName: jest.fn().mockReturnValue('Alice'),
//         getReceiverName: jest.fn().mockReturnValue('Bob'),
//         getStatus: jest.fn().mockReturnValue('sent'),
//         getTimestamp: jest.fn().mockReturnValue(new Date()),
//         getIsViewed: jest.fn().mockReturnValue(false),
//       },
//     ]);

//     PrivateMessage.markedAsViewed.mockResolvedValue(true);

//     await privateChatController.getLatestMessageBetweenUsers(req, res);

//     // expect(res.status).toBe(200);
//     expect(res.json).toHaveBeenCalledWith(
//       expect.objectContaining({
//         message: 'OK',
//       }),
//     );
//   });
// });
