import JWT from '../utils/jwt.js';

class speedTestController {
  constructor(publicChatModel) {
    this.publicChatModel = publicChatModel;
  }

  static testState = false;

  static getTestState = () => speedTestController.testState;

  static setState(state) {
    speedTestController.testState = state;
  }

  /**
   * to check if current system is in performance testing state
   */
  // eslint-disable-next-line class-methods-use-this
  async getIsTestState(req, res) {
    res.status(200).json({ message: 'OK', isTest: speedTestController.testState });
  }

  async startSpeedTest(req, res) {
    // user authentication
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      res.status(401).json({ message: 'User not logged in' });
      return;
    }
    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      res.status(401);
      res.json({ message: 'User not logged in' });
      return;
    }
    const { duration, interval } = req.body;
    speedTestController.testState = true;
    const PublicTestMessage = this.publicChatModel;

    // socket notify users that start testing!
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('startspeedtest');

    const startTime = Date.now();
    let postCount = 0;
    let getCount = 0;
    let isPosting = true;
    const MAX_POST_COUNT = 1000;
    const errors = [];

    const testInterval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      // Switch to GET requests halfway through the test
      // OR if the max number of POSTs has been reached
      if ((elapsed > duration / 2 || postCount >= MAX_POST_COUNT) && isPosting) {
        isPosting = false;
      }
      if (isPosting) {
        try {
          // Create a new test message
          const testMessage = new PublicTestMessage({
            content: '12345678901234567890',
            senderName: `Test Sender ${postCount}`,
            timestamp: Date.now(),
            status: 'GREEN',
          });
          await testMessage.save();
          postCount += 1;
        } catch (error) {
          console.error('Failed to save test message:', error);
          errors.push(error);
        }
      } else {
        try {
          await PublicTestMessage.findOne({ senderName: `Test Sender ${getCount}` });
          getCount += 1;
        } catch (error) {
          console.error('Failed to get test messages:', error);
          errors.push(error);
        }
      }
      // Stop the test if the duration has elapsed
      if (elapsed > duration) {
        clearInterval(testInterval);
        try {
          await PublicTestMessage.deleteMany();
        } catch (deleteError) {
          console.error('Failed to clear test messages:', deleteError);
        }
        speedTestController.setState(false);
        res.status(200).json({
          message: 'Test completed',
          POSTs: postCount,
          GETs: getCount,
          errors,
        });

        // broadcast to users that performance test is finished
        socketServer.publishEvent('finishspeedtest');
      }
    }, interval);
  }
}
export default speedTestController;
