import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

const standardizeMedicineName = (name) => name
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .split(' ')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

class requestController {
  // constructor
  constructor(requestModel, medicineModel, userModel) {
    this.requestModel = requestModel;
    this.medicineModel = medicineModel;
    this.userModel = userModel;
  }

  /**
   * Get all history requests
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
    const requests = await this.requestModel.find({}).populate('user').sort({ timeStamp: -1 });
    const data = requests.map((request) => ({
      ...request.toObject(),
      username: request.user.username,
    }));
    res.status(200).json({ success: true, data });
  }

  // post new medicine donation
  async postNewRequest(req, res) {
    // console.log(req.body);
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
      // console.log(req.body);
      res.status(400);
      res.json({ message: 'Invalid request' });
      return;
    }

    const { medicinename, quantity } = req.body;
    const standardizedMedicineName = standardizeMedicineName(medicinename);

    // const request = await this.requestModel.getOne({ medicineName });

    const user = await this.userModel.getIdByUsername(payload.username);
    const data = {
      medicinename: standardizedMedicineName,
      quantity,
      // username: payload.username,
      user: user._id,
      status: 'Waiting for Review',
      timestamp: Date.now(),
    };
      // eslint-disable-next-line new-cap
    const newRequest = new this.requestModel(data);

    // eslint-disable-next-line new-cap
    await newRequest.save();

    const socketServer = req.app.get('socketServer');
    let request = await newRequest.populate('user');
    request = { ...newRequest.toObject(), username: payload.username };
    socketServer.publishEvent('newRequest', request);

    res.status(201).json({ success: true, data: request });
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

      const socketServer = req.app.get('socketServer');
      socketServer.publishEvent('medicineUpdated', { medicinename: medicine.medicinename, newQuantity: medicine.quantity });
    } else if (status === 'Rejected') { /* empty */ }

    // Update the request status
    request.status = status;
    await request.save();

    let requestObject = await request.populate('user');
    requestObject = { ...requestObject.toObject(), username: requestObject.user.username };

    return res.status(200).json({ message: `Request ${status.toLowerCase()} successfully`, request: requestObject });
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
    const user = await this.userModel.getIdByUsername(username);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const requests = await this.requestModel.find({ user }).populate('user').sort({ timeStamp: -1 });
    const taskList = requests.map(async (request) => ({
      ...request.toObject(),
      username,
    }));
    const data = await Promise.all(taskList);
    res.status(200).json({ success: true, data });
  }

  async deleteRequest(req, res) {
    const { requestId } = req.params;
    const payload = authChecker.checkAuth(req, res);

    if (payload === null) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const request = await this.requestModel.findById(requestId).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.user.username !== payload.username) {
      return res.status(403).json({ message: 'Unauthorized to delete this request' });
    }

    if (request.status !== 'Waiting for Review') {
      return res.status(400).json({ message: 'Only requests with status "Waiting" can be deleted' });
    }

    await this.requestModel.findByIdAndDelete(requestId);

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('deleteRequest', { requestId, username: payload.username });

    return res.status(200).json({ message: 'Request deleted successfully' });
  }
}

export default requestController;
