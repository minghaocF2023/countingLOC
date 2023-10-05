import jwt from 'jsonwebtoken';

class JWT {
  static TOKEN_SECRET = 'Some secret keys';

  static generateToken(username) {
    const payload = { username };
    return jwt.sign(payload, this.TOKEN_SECRET, { expiresIn: '3600s' });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, this.TOKEN_SECRET);
    } catch (err) {
      return null;
    }
  }
}

export default JWT;
