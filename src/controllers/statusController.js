import authChecker from '../utils/authChecker.js';
import 'dotenv/config';
import testChecker from '../utils/testChecker.js';

class StatusController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getStatus(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { username } = payload;
    const user = await this.userModel.getOne({ username });

    if (!user) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }
    res.status(200).json({ message: 'OK', status: user.status, statusTimestamp: user.statusTimestamp });
  }

  async updateStatus(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { username } = payload;
    const { status } = req.params;

    const user = await this.userModel.getOne({ username });
    if (!user) {
      res.status(404).json({ message: 'User not found!' });
      return;
    }

    user.status = status;
    user.statusTimestamp = new Date();
    await user.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newStatus', user);

    res.status(200).json({ message: 'Status updated successfully!', status: user.status, statusTimestamp: user.statusTimestamp });
  }
}

export default StatusController;
