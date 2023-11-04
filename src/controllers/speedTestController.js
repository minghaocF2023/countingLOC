import authChecker from '../utils/authChecker.js';

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

  // eslint-disable-next-line class-methods-use-this
  async startSpeedTest(req, res) {
    // user authentication
    const payload = authChecker(req, res);
    if (!payload) {
      console.error('authorization error');
      return;
    }

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return;
    }
    const { username } = payload;
    global.isTest = true;
    global.testUser = username;
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('startspeedtest', { username: payload.username });
    res.status(200).json({ message: `set isTest to ${global.isTest}` });
  }

  // eslint-disable-next-line class-methods-use-this
  async stopSpeedTest(req, res) {
    const payload = authChecker(req, res);
    if (!payload) {
      console.error('authorization error');
      return;
    }

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return;
    }
    global.isTest = false;
    global.testUser = null;
    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('stopspeedtest', { username: payload.username });
    res.status(200).json({ message: `set isTest to ${global.isTest}` });
  }
}
export default speedTestController;
