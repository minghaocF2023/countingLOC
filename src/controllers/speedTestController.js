// import mongoose from 'mongoose';
// import publicMessageFactory from '../models/publicMessageModel.js';
import { testConnection } from '../services/db.js';
import publicMessageFactory from '../models/publicMessageModel.js';

class speedTestController {
  testState = false;

  static getState = () => this.testState;

  static setState = (state) => {
    this.testState = state;
  };

  /**
   * to check if current system is in performance testing state
   */
  static async getIsTestState(req, res) {
    res.status(200).json({ message: 'OK', isTest: this.testState });
  }

  static async startSpeedTest(req, res) {
    const { isTest, duration, interval } = req.body;
    this.setState(isTest);
    // console.log('Speed test started');
    const PublicTestMessage = publicMessageFactory(testConnection);

    // socket notify users that start testing!
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('speedtest', { test: true });

    // Create a new test message
    const testMessage = new PublicTestMessage({
      content: 'This is a 20 word ms',
      senderName: 'Test sender',
      timestamp: Date.now(),
      status: 'GREEN',
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
  }

  static async getMessageBetweenUsers(req, res) {
    res.status(501).json({ message: 'Not implemented' });
  }
}
export default speedTestController;
