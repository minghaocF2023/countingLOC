import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

class ReportEventController {
  constructor(emergencyEventModel) {
    this.emergencyEventModel = emergencyEventModel;
    // this.userModel = userModel;
  }

  async createEmergencyEvent(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    await this.emergencyEventModel.create(req.body)
      .then((ee) => res.status(201).json({ message: 'OK', event: ee }))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });

    const [lat, lng] = req.body.coordinates || [];
    if (lat && lng) {
      const socketServer = req.app.get('socketServer');
      socketServer.publishEvent('emergency', req.body);
    }
  }

  async getEmergencyEvents(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    await this.emergencyEventModel.get({}).then((events) => {
      res.status(200);
      res.json({
        message: 'OK',
        events,
      });
    }).catch((e) => {
      console.error(e);
      res.status(500);
      res.json({ message: 'Internal server error' });
    });
  }
}

export default ReportEventController;
