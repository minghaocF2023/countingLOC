import jwt from 'jsonwebtoken';

class JWT {
  constructor(secret) {
    if (JWT.instance) {
      // eslint-disable-next-line no-constructor-return
      return JWT.instance;
    }

    this.TOKEN_SECRET = secret;
    JWT.instance = this;
  }

  generateToken(username) {
    const payload = { username };
    return jwt.sign(payload, this.TOKEN_SECRET, { expiresIn: '3600s' });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.TOKEN_SECRET);
    } catch (err) {
      console.error(token);
      console.error(err);
      return null;
    }
  }
}

export default JWT;
