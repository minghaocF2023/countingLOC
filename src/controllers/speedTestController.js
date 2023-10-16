// import mongoose from 'mongoose';
// import publicMessageFactory from '../models/publicMessageModel.js';
import { testConnection } from '../services/db.js';
import publicMessageFactory from '../models/publicMessageModel.js';

let testState = false;
const getTestState = () => testState;
const setIsTest = (isTest) => {
  testState = isTest;
};
const getIsTestState = (req, res) => {
  res.status(200).json({ message: 'OK', isTest: getTestState });
};
const startSpeedTest = async (req, res) => {
  const { isTest } = req.body;
  setIsTest(isTest);
  console.log('Speed test started');
  const PublicTestMessage = publicMessageFactory(testConnection);

  // Create a new test message
  const testMessage = new PublicTestMessage({
    content: 'Test content',
    senderName: 'Test sender',
    timestamp: Date.now(),
    status: 'Test status',
  });

  // Save the test message to the database
  try {
    await testMessage.save();
    console.log('Test message saved to the database');
    res.status(200).json({ message: 'OK' });
  } catch (error) {
    console.error('Failed to save test message:', error);
    res.status(500).json({ message: 'Failed to save test message' });
  }
};

export {
  getTestState, setIsTest, startSpeedTest, getIsTestState,
};
