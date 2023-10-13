import { User } from '../models/models.js';
import JWT from '../utils/jwt.js';

class StatusController {
  static async getStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const payload = JWT.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload.username;

    const user = await User.getOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    return res.status(200).json({ message: 'OK', status: user.status, statusTimestamp: Date.now() });
  }

  static async updateStatus(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const payload = JWT.verifyToken(req.headers.authorization.split(' ')[1]);
    if (payload === null) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { username } = payload.username;
    const { status } = req.status;

    const user = await User.getOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({ message: 'Status updated successfully!', status: user.status });
  }
}

export default StatusController;
