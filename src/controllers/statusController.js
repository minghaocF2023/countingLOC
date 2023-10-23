import JWT from '../utils/jwt.js';
import 'dotenv/config';

class StatusController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const token = req.headers.authorization.split(' ')[1];
    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(token);

    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload;
    const user = await this.userModel.getOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    return res.status(200).json({ message: 'OK', status: user.status, statusTimestamp: user.statusTimestamp });
  }

  async updateStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const jwt = new JWT(process.env.JWTSECRET);
    const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload;
    const { status } = req.params;

    const user = await this.userModel.getOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    user.status = status;
    user.statusTimestamp = new Date();
    await user.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newStatus', user.status);

    return res.status(200).json({ message: 'Status updated successfully!', status: user.status, statusTimestamp: user.statusTimestamp });
  }
}

export default StatusController;
