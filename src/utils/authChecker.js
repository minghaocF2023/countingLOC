import JWT from './jwt.js';
import 'dotenv/config';

const authChecker = (req, res) => {
  if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
    res.status(401).json({ message: 'User not logged in' });
    return null;
  }
  const jwt = new JWT(process.env.JWTSECRET);
  const payload = jwt.verifyToken(req.headers.authorization.split(' ')[1]);
  if (payload === null) {
    res.status(401);
    res.json({ message: 'User not logged in' });
    return null;
  }
  return payload;
};

export default authChecker;
