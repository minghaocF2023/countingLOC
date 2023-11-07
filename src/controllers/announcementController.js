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
    const announcements = await this.announcementModel.find({}).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: announcements });
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

  // async deleteAnnouncement(req, res) {
  //   this.announcementModel.deleteMany({
  //     senderName: req.body.senderName,
  //   }).then(() => {
  //     res.status(200).json({ message: 'deleted' });
  //   });
  // }
}

export default announcementController;
