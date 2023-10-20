import { User } from '../models/models.js';
import JWT from '../utils/jwt.js';

class StatusController {
  static async getStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const token = req.headers.authorization.split(' ')[1];
    const payload = JWT.verifyToken(token);

    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload;
    const user = await User.getOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    return res.status(200).json({ message: 'OK', status: user.status, statusTimestamp: user.statusTimestamp });
  }

  static async updateStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const payload = JWT.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload;
    const { status } = req.params;

    const user = await User.getOne({ username });
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
