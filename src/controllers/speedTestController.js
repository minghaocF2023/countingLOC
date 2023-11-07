import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

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
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
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
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
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
