import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

const standardizeMedicineName = (name) => name
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .split(' ')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

class medicineController {
  // constructor
  constructor(medicineModel, userModel) {
    this.medicineModel = medicineModel;
    this.userModel = userModel;
  }

  /**
   * Get all history medicine
   */
  async getAllMedicines(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    // sort medicines by medicine name
    const medicines = await this.medicineModel.find({}).sort({ medicinename: 1 });
    res.status(200).json({ success: true, data: medicines });
  }

  // post new medicine donation
  async donateNewMedicine(req, res) {
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
    const standardizedName = standardizeMedicineName(medicinename);

    let medicine = await this.medicineModel.getOne({ medicinename: standardizedName });

    if (medicine) {
      medicine.quantity += quantity;
    } else {
      const data = {
        medicinename: standardizedName,
        quantity,
      };
      // eslint-disable-next-line new-cap
      medicine = new this.medicineModel(data);
    }

    // eslint-disable-next-line new-cap
    await medicine.save();

    const socketServer = req.app.get('socketServer');
    socketServer.publishEvent('newMedicine', medicine);

    res.status(201).json({ success: true, data: medicine });
  }
}

export default medicineController;
