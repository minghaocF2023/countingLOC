import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

class requestController {
  // constructor
  constructor(requestModel, medicineModel, userModel) {
    this.requestModel = requestModel;
    this.medicineModel = medicineModel;
    this.userModel = userModel;
  }

  /**
   * Get all history medicine
   */
  async getAllRequests(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort medicines by medicine name
    const requests = await this.requestModel.find({}).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: requests });
  }

  // post new medicine donation
  async postNewRequest(req, res) {
    console.log(req.body);
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
    if (!req.body.medicinename || !req.body.quantity) {
      console.log(req.body);
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const { medicinename, quantity } = req.body;

    // const request = await this.requestModel.getOne({ medicineName });

    const data = {
      medicinename,
      quantity,
      username: payload.username,
      status: 'Waiting for Review',
      timestamp: Date.now(),
    };
      // eslint-disable-next-line new-cap
    const newRequest = new this.requestModel(data);

    // eslint-disable-next-line new-cap
    await newRequest.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newRequest', newRequest);

    res.status(201).json({ success: true, data: newRequest });
  }

  // update request status to be either approved or rejected
  async updateRequest(req, res) {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await this.requestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if request is already processed
    if (request.status === 'Approved' || request.status === 'Rejected') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    if (status === 'Approved') {
      const medicine = await this.medicineModel.findOne({ medicinename: request.medicinename });
      if (!medicine || medicine.quantity < request.quantity) {
        return res.status(400).json({ message: 'Insufficient medicine stock' });
      }
      medicine.quantity -= request.quantity;
      await medicine.save();
    } else if (status === 'Rejected') { /* empty */ }

    // Update the request status
    request.status = status;
    await request.save();

    // eslint-disable-next-line max-len
    // const socketServer = req.app.get('socketServer'); // Assuming socketServer is attached to the app
    // socketServer.to(request.username).emit('requestStatusUpdated', {
    //   // eslint-disable-next-line no-underscore-dangle
    //   requestId: request._id.toString(),
    //   status,
    // });

    return res.status(200).json({ message: `Request ${status.toLowerCase()} successfully`, request });
  }

  // get requests by username
  async getUserRequests(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort medicines by medicine name
    const { username } = req.params;
    const requests = await this.requestModel.find({ username }).sort({ timeStamp: -1 });
    res.status(200).json({ success: true, data: requests });
  }
}

export default requestController;
