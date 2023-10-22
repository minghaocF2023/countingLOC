import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import app from '../app.js';

let mongod;
const PORT = 3000;
const HOST = `http://localhost:${PORT}`;

let server;

beforeAll(async () => {
  server = app;
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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

// /**
// Query-type test: Fetch a user's status
test('Fetch user status successfully', async () => {
  const testUser = 'YukeTest1';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inl1a2V0ZXN0MSIsImlhdCI6MTY5Nzk2MDY1NywiZXhwIjoxNjk3OTY0MjU3fQ.aRfWPx6_kUniaa6i0jV4XlfViDZDwclVZSENHbny83Q';
  const response = await axios.get(`${HOST}/users/${testUser}/status`, {
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
  });

  expect(response.status).toBe(200);
  expect(response.data.message).toBe('OK');
  // expect(response.data.status).toBeDefined(); // or other assertions related to status
});
//  */

// State-updating test: Updating a user's status
test('Update user status', async () => {
  const testUser = 'YukeTest1';
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inl1a2V0ZXN0MSIsImlhdCI6MTY5Nzk2MDY1NywiZXhwIjoxNjk3OTY0MjU3fQ.aRfWPx6_kUniaa6i0jV4XlfViDZDwclVZSENHbny83Q';
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
