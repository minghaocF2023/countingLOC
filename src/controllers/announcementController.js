/* eslint-disable no-underscore-dangle */
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

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
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort announcements by timestamp
    const announcements = await this.announcementModel.find({}).populate('sender').sort({ timeStamp: -1 });

    // filter out announcements by inactive users
    const filteredAnnouncements = announcements.filter(
      (announcement) => announcement.sender.isActive,
    );
    res.status(200).json({ success: true, data: filteredAnnouncements });
  }

  // post new announcement
  async postNew(req, res) {
    if (!req.headers.authorization || !req.headers.authorization.includes('Bearer')) {
      res.status(401).json({ message: 'User not logged in' });
      return;
    }

    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }
    if (!req.body.content) {
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const { content } = req.body;
    const sender = await this.userModel.getIdByUsername(payload.username);
    const data = {
      content,
      sender,
      timestamp: Date.now(),
    };

    // eslint-disable-next-line new-cap
    const newAnnouncement = new this.announcementModel(data);
    await newAnnouncement.save();

    const socketServer = req.app.get('socketServer');
    const announcement = await newAnnouncement.populate('sender');
    socketServer.publishEvent('newAnnouncement', announcement);

    res.status(201).json({ success: true, data: announcement });
  }
}

export default announcementController;
