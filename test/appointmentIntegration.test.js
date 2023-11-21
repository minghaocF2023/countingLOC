/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import mongoose from 'mongoose';
import axios from 'axios';
import app from '../app.js';
import userFactory from '../src/models/userModel.js';
import JWT from '../src/utils/jwt.js';
import appointmentFactory from '../src/models/appointmentModel.js';

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
let server;
let User;
let mockToken1;
let mockToken2;
let mockDoctor1;
let mockPatient1;

beforeAll(async () => {
  User = userFactory(mongoose);
  const jwt = new JWT('Some secret keys');
  const salt = 'some-salt';
  const password = await User.hashPassword('password', salt);
  mockDoctor1 = {
    username: 'testdoctor1',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
    isDoctor: true,
  };
  mockPatient1 = {
    username: 'testpatient1',
    password,
    salt,
    chatrooms: [],
    isOnline: false,
    status: 'Undefined',
    statusTimestamp: new Date(),
    isDoctor: false,
  };
  await axios.post(`${HOST}/users`, { username: mockDoctor1.username, password: mockDoctor1.password }, { params: { istest: 'true' } });
  await axios.post(`${HOST}/users`, { username: mockPatient1.username, password: mockPatient1.password }, { params: { istest: 'true' } });
  mockToken1 = jwt.generateToken(mockDoctor1.username);
  mockToken2 = jwt.generateToken(mockPatient1.username);
  server = app;
  console('hihi');
});

afterAll(async () => {
  await axios.delete(`${HOST}/users`, { data: { username: mockDoctor1.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/users`, { data: { username: mockPatient1.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/messages/private`, { data: { senderName: mockDoctor1.username, receiverName: mockPatient1.username }, params: { istest: 'true' } });
  await axios.delete(`${HOST}/admin/chatroom`, { data: { senderName: mockDoctor1.username, receiverName: mockPatient1.username }, params: { istest: 'true' } });
  await mongoose.disconnect().then(() => {
    server.close();
  });
});

/**
 * Integration tests for endpoint GET /doctorAppointment/doctorappt
 */
test('should return all appointments for a doctor on a specific date', async () => {
  const date = '2023-11-16';

  const response = await axios.get(`${HOST}/doctorAppointment/doctorappt`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('appointments');
  expect(response.data.appointments).toBeInstanceOf(Array);
}, 30000);

test('should return an error if user is not logged in', async () => {
  await expect(axios.get(`${HOST}/doctorAppointment/doctorappt`, {
    params: { date: '2023-11-16', istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint GET /doctorAppointment/doctortimeslot
 */
test('should return all available time slots has not been selected yet by the doctor on a specific date', async () => {
  const date = '2023-11-17';

  const response = await axios.get(`${HOST}/doctorAppointment/doctortimeslot`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('timeslots');
  expect(response.data.timeslots).toHaveLength(10);
}, 30000);
test('should return an error if user is not logged in', async () => {
  await expect(axios.get(`${HOST}/doctorAppointment/doctortimeslot`, {
    params: { date: '2023-11-17', istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint POST /doctorAppointment/newavailability
 */
test('can create one new availability for a doctor on a specific date', async () => {
  const date = '2023-11-18';
  const startTimes = [10];

  const response1 = await axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date,
    startTimes,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  expect(response1.status).toBe(201);
  expect(response1.data).toHaveProperty('success');
  expect(response1.data.success).toBe(true);

  const response2 = await axios.get(`${HOST}/doctorAppointment/doctortimeslot`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });
  startTimes.forEach((startTime) => {
    expect(response2.data.timeslots).not.toContain(startTime);
  });
}, 30000);

test('can create multiple new availability for a doctor on a specific date', async () => {
  const date = '2023-11-18';
  const startTimes = [10, 11, 12, 13];

  const response1 = await axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date,
    startTimes,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  expect(response1.status).toBe(201);
  expect(response1.data).toHaveProperty('success');
  expect(response1.data.success).toBe(true);

  const response2 = await axios.get(`${HOST}/doctorAppointment/doctortimeslot`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });
  startTimes.forEach((startTime) => {
    expect(response2.data.timeslots).not.toContain(startTime);
  });
}, 30000);

test('should return an error if user is not logged in', async () => {
  await expect(axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date: '2023-11-18',
    startTimes: [10],
  }, {
    params: { istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint GET /patientAppointment/patientappt
 */
test('should return all appointments for a patient on a specific date', async () => {
  const date = '2023-11-19';

  const response = await axios.get(`${HOST}/patientAppointment/patientappt`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('appointments');
  expect(response.data.appointments).toBeInstanceOf(Array);
}, 30000);

test('should return an error if user is not logged in', async () => {
  await expect(axios.get(`${HOST}/patientAppointment/patientappt`, {
    params: { date: '2023-11-19', istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint GET /patientAppointment/getdoctorsavailability
 */
test('should return all doctors and their vacant availabilities on a specific date', async () => {
  const date = '2023-11-20';

  const response = await axios.get(`${HOST}/patientAppointment/getdoctorsavailability`, {
    params: { date, istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });

  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('doctors');
  expect(response.data.doctors).toBeInstanceOf(Array);
}, 30000);

test('should return an error if user is not logged in', async () => {
  await expect(axios.get(`${HOST}/patientAppointment/getdoctorsavailability`, {
    params: { date: '2023-11-20', istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint POST /patientAppointment/newappointment
 */
test('can create one new appointment for a patient on a specific date', async () => {
  const date = '2023-11-21';
  const startTime = 10;
  const doctorUsername = mockDoctor1.username;

  const startTimes = [10];

  const response1 = await axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date,
    startTimes,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  const response2 = await axios.post(`${HOST}/patientAppointment/newappointment`, {
    date,
    startTime,
    doctorUsername,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });

  expect(response2.status).toBe(200);
  expect(response2.data).toHaveProperty('success');
  expect(response2.data.success).toBe(true);
}, 30000);

test('cannot create appointment if availability does not exist', async () => {
  const date = '2023-11-25';
  const startTime = 10;
  const doctorUsername = mockDoctor1.username;

  await expect(axios.post(`${HOST}/patientAppointment/newappointment`, {
    date,
    startTime,
    doctorUsername,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  })).rejects.toThrow();
}, 30000);

test('cannot book appointment if user is not logged in', async () => {
  await expect(axios.post(`${HOST}/patientAppointment/newappointment`, {
    date: '2023-11-21',
    startTime: 10,
    doctorUsername: mockDoctor1.username,
  }, {
    params: { istest: 'true' },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint DELETE/patientAppointment/deleteappointment
 */
test('can delete one appointment for a patient on a specific date', async () => {
  const date = '2023-11-22';
  const startTime = 10;
  const doctorUsername = mockDoctor1.username;

  const startTimes = [10];

  await axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date,
    startTimes,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  await axios.post(`${HOST}/patientAppointment/newappointment`, {
    date,
    startTime,
    doctorUsername,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });

  const response1 = await axios.delete(`${HOST}/patientAppointment/deleteappointment`, {
    params: {
      date, startTime, doctorUsername, istest: 'true',
    },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });
  expect(response1.status).toBe(200);
  expect(response1.data.success).toBe(true);
}, 30000);

test('cannot delete appointment if appointment does not exist', async () => {
  const date = '2023-11-25';
  const startTime = 11;
  const doctorUsername = mockDoctor1.username;

  await expect(axios.delete(`${HOST}/patientAppointment/deleteappointment`, {
    params: {
      date, startTime, doctorUsername, istest: 'true',
    },
    headers: { Authorization: `Bearer ${mockToken2}` },
  })).rejects.toThrow();
}, 30000);

test('cannot delete appointment if user is not logged in', async () => {
  await expect(axios.delete(`${HOST}/patientAppointment/deleteappointment`, {
    params: {
      date: '2023-11-22', startTime: 10, doctorUsername: mockDoctor1.username, istest: 'true',
    },
  })).rejects.toThrow();
}, 30000);

/**
 * Integration test for endpoint PUT /patientAppointment/updateappointment
 */
test('can update one appointment for a patient on a specific date', async () => {
  const date = '2023-11-23';
  const startTime = 10;
  const doctorUsername = mockDoctor1.username;

  const startTimes = [10, 11];

  await axios.post(`${HOST}/doctorAppointment/newavailability`, {
    date,
    startTimes,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken1}` },
  });

  await axios.post(`${HOST}/patientAppointment/newappointment`, {
    date,
    startTime,
    doctorUsername,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });

  const response1 = await axios.put(`${HOST}/patientAppointment/updateappointment`, {
    dateOld: date, dateNew: date, startTimeOld: startTime, startTimeNew: 11, doctorUsernameOld: doctorUsername, doctorUsernameNew: doctorUsername,
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  });
  expect(response1.status).toBe(200);
  expect(response1.data.success).toBe(true);
}, 30000);

test('cannot update appointment if appointment does not exist', async () => {
  const date = '2023-11-25';
  const startTime = 10;
  const doctorUsername = mockDoctor1.username;

  await expect(axios.put(`${HOST}/patientAppointment/updateappointment`, {
    dateOld: date, dateNew: date, startTimeOld: startTime, startTimeNew: 11, doctorUsernameOld: doctorUsername, doctorUsernameNew: doctorUsername, istest: 'true',
  }, {
    params: { istest: 'true' },
    headers: { Authorization: `Bearer ${mockToken2}` },
  })).rejects.toThrow();
}, 30000);

test('cannot update appointment if user is not logged in', async () => {
  await expect(axios.put(`${HOST}/patientAppointment/updateappointment`, {
    dateOld: '2023-11-23', dateNew: '2023-11-23', startTimeOld: 10, startTimeNew: 11, doctorUsernameOld: mockDoctor1.username, doctorUsernameNew: mockDoctor1.username, istest: 'true',
  }, {
    params: { istest: 'true' },
  })).rejects.toThrow();
}, 30000);
