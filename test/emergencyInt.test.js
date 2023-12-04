import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import EmergencyEventFactory from '../src/models/emergencyEvent.js';
import UserFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';
import { testConnection } from '../src/services/db.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;

let mockToken1;
let mockUser1;

let User;
let EmergencyEvent;

beforeAll(async () => {
  User = UserFactory(testConnection);
  EmergencyEvent = EmergencyEventFactory(testConnection);
  await EmergencyEvent.deleteMany({});
  await User.deleteMany({});

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

  await axios.post(`${HOST}/users`, { username: mockUser1.username, password: mockUser1.password }, { params: { istest: 'true' } });
  mockToken1 = jwt.generateToken(mockUser1.username);

  server = app;
});

afterAll(async () => {
  // await axios.delete(`${HOST}/emergency/events`, { params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockUser1.username }, params: { istest: 'true' } });
  await mongoose.disconnect();
  await server.close();
}, 10000);

describe('Emergency Event Integration Tests', () => {
  it('should create an emergency event and retrieve the list', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      timestamp: Date.now(),
      location: 'Test Location',
      severity: 1,
      range_affected: 'Test Range',
    };

    const response = await axios.post(`${HOST}/emergency/events`, mockEvent, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('OK');
    expect(response.data.event).toMatchObject(mockEvent);

    const response2 = await axios.get(`${HOST}/emergency/events`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.message).toBe('OK');
    expect(response2.data.events).toHaveLength(1);
    expect(response2.data.events[0]).toMatchObject(mockEvent);

    // eslint-disable-next-line no-underscore-dangle
    await axios.delete(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
  });

  it('should get an emergency event by id', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      timestamp: Date.now(),
      location: 'Test Location',
      severity: 1,
      range_affected: 'Test Range',
    };

    const response = await axios.post(`${HOST}/emergency/events`, mockEvent, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('OK');
    expect(response.data.event).toMatchObject(mockEvent);

    const response2 = await axios.get(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.message).toBe('OK');
    expect(response2.data.event).toMatchObject(mockEvent);

    // eslint-disable-next-line no-underscore-dangle
    await axios.delete(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
  });

  it('should update an emergency event by id', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      timestamp: Date.now(),
      location: 'Test Location',
      severity: 1,
      range_affected: 'Test Range',
    };

    const response = await axios.post(`${HOST}/emergency/events`, mockEvent, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('OK');
    expect(response.data.event).toMatchObject(mockEvent);

    const mockUpdate = {
      title: 'Updated Test Event',
      description: 'Updated Test Description',
      timestamp: Date.now(),
      location: 'Updated Test Location',
      severity: 2,
      range_affected: 'Updated Test Range',
    };

    const response2 = await axios.put(`${HOST}/emergency/events/${response.data.event._id}`, mockUpdate, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.message).toBe('OK');

    const response3 = await axios.get(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(response3.status).toBe(200);
    expect(response3.data.message).toBe('OK');
    expect(response3.data.event).toMatchObject(mockUpdate);

    // eslint-disable-next-line no-underscore-dangle
    await axios.delete(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
  });

  it('should delete an emergency event by id', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      timestamp: Date.now(),
      location: 'Test Location',
      severity: 1,
      range_affected: 'Test Range',
    };

    const response = await axios.post(`${HOST}/emergency/events`, mockEvent, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });
    expect(response.status).toBe(201);
    expect(response.data.message).toBe('OK');
    expect(response.data.event).toMatchObject(mockEvent);

    // eslint-disable-next-line no-underscore-dangle
    const response2 = await axios.delete(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    });

    expect(response2.status).toBe(200);
    expect(response2.data.message).toBe('OK');

    await axios.get(`${HOST}/emergency/events/${response.data.event._id}`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    }).catch((err) => {
      expect(err.response.status).toBe(404);
      expect(err.response.data.message).toBe('Event Not Found');
    });
  });

  it('should not create an emergency event with missing fields', async () => {
    const mockEvent = {
      title: 'Test Event',
      description: 'Test Description',
      timestamp: Date.now(),
      location: 'Test Location',
      severity: 1,
    };

    await axios.post(`${HOST}/emergency/events`, mockEvent, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    }).catch((err) => {
      expect(err.response.status).toBe(400);
      expect(err.response.data.message).toBe('Invalid request');
    });
  });

  it('should not delete an emergency event with invalid id', async () => {
    await axios.delete(`${HOST}/emergency/events/655de99ffa4acb7e9ffdbe65`, {
      params: { istest: 'true' },
      headers: { Authorization: `Bearer ${mockToken1}` },
    }).catch((err) => {
      expect(err.response.status).toBe(404);
      expect(err.response.data.message).toBe('Event Not Found');
    });
  });
});
