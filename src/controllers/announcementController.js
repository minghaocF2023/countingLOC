import JWT from '../utils/jwt.js';

class announcementController {
  // constructor
  constructor(announcementModel, userModel) {
    this.announcementModel = announcementModel;
    this.userModel = userModel;
  }

  /**
   * Get all history announcements
   */
  async getLatestAnnouncements(req, res) {
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

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return;
    }
    // sort announcements by timestamp
    const announcements = await this.announcementModel.find({}).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: announcements });
  }

  // post new announcement
  async postNew(req, res) {
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

    if (global.isTest === true && global.testUser !== payload.username) {
      res.status(503).json({ message: 'under speed test' });
      return;
    }
    if (!req.body.content) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const { content } = req.body;
    const data = {
      content,
      senderName: payload.username,
      timestamp: Date.now(),
    };

    // eslint-disable-next-line new-cap
    const newAnnouncement = new this.announcementModel(data);
    await newAnnouncement.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newAnnouncement', newAnnouncement);

    res.status(201).json({ success: true, data: newAnnouncement });
  }
}

export default announcementController;
