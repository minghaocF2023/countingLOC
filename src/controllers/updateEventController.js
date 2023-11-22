import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

class UpdateEventController {
  constructor(emergencyEventModel) {
    this.emergencyEventModel = emergencyEventModel;
  }

  async getEmergencyEvent(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { id } = req.params;

    await this.emergencyEventModel.getById(id)
      .then((event) => {
        if (!event) {
          res.status(404).json({ message: 'Event Not Found' });
          return;
        }
        res.status(200).json({ message: 'OK', event });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  }

  async updateEmergencyEvent(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { id } = req.params;
    const update = req.body;

    if (!update || Object.values(update).includes(undefined)) {
      res.status(400).json({ message: 'Invalid request' });
      return;
    }

    let event;
    try {
      event = await this.emergencyEventModel.getById(id);
      if (!event) {
        res.status(404).json({ message: 'Event Not Found' });
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    await event.update(update)
      .then((ee) => res.status(200).json({ message: 'OK', event: ee }))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  }

  async deleteEmergencyEvent(req, res) {
    const payload = authChecker.checkAuth(req, res);

    if (!payload) {
      return;
    }

    if (testChecker.isTest(res, payload)) {
      return;
    }

    const { id } = req.params;

    let event;
    try {
      event = await this.emergencyEventModel.getById(id);
      if (!event) {
        res.status(404).json({ message: 'Event Not Found' });
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    await event.delete()
      .then(() => res.status(200).json({ message: 'OK' }))
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  }
}

export default UpdateEventController;
