import authChecker from '../src/utils/authChecker';
import testChecker from '../src/utils/testChecker';
import medicineController from '../src/controllers/medicineController';

jest.mock('../src/utils/authChecker');
jest.mock('../src/utils/testChecker');

describe('medicineController', () => {
  let controller;
  let mockMedicineModel;
  let mockSave;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockSort = jest.fn().mockResolvedValue([]);
    mockSave = jest.fn().mockResolvedValue(true);
    mockMedicineModel = jest.fn().mockImplementation(() => ({ save: mockSave }));
    mockMedicineModel.find = jest.fn(() => ({ sort: mockSort }));
    mockMedicineModel.findOne = jest.fn().mockResolvedValue(null);
    mockMedicineModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    mockMedicineModel.findOneAndDelete = jest.fn().mockResolvedValue(null);

    // eslint-disable-next-line new-cap
    controller = new medicineController(mockMedicineModel);

    req = {
      headers: {},
      body: {},
      params: {},
      query: {},
      app: { get: jest.fn() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('medicines', () => {
    it('return all medicines if authorized', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'admin' });

      await controller.getAllMedicines(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return all medicines if NOT authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getAllMedicines(req, res);

      // Check if the unauthorized status code is set
      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  describe('donate medicine', () => {
    it('should add a new medicine if authorized', async () => {
      // Setting up the request to simulate an authorized user
      req.headers.authorization = 'Bearer valid-token'; // Simulating a valid authorization token
      req.body = {
        medicinename: 'test',
        quantity: 3,
      };
      req.app.get.mockReturnValue({ publishEvent: jest.fn() });

      authChecker.checkAuth.mockReturnValue({ username: 'admin' });
      testChecker.isTest.mockReturnValue(false);

      mockMedicineModel.getOne = jest.fn().mockResolvedValue(null);
      mockMedicineModel.mockImplementation(() => ({ save: mockSave }));

      await controller.donateNewMedicine(req, res);

      expect(mockMedicineModel.getOne).toHaveBeenCalledWith({ medicinename: 'Test' });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should not add a new medicine if NOT authorized', async () => {
      req.headers.authorization = '';
      req.body = {
        medicinename: 'test',
        quantity: 3,
      };
      req.app.get.mockReturnValue({ publishEvent: jest.fn() });

      authChecker.checkAuth.mockReturnValue(null);
      testChecker.isTest.mockReturnValue(false);

      mockMedicineModel.getOne = jest.fn().mockResolvedValue(null);
      mockMedicineModel.mockImplementation(() => ({ save: mockSave }));

      await controller.donateNewMedicine(req, res);

      expect(mockMedicineModel.getOne).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not logged in' }));
    });
  });
});
