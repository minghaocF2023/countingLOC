import authChecker from '../src/utils/authChecker';
import testChecker from '../src/utils/testChecker';
import requestController from '../src/controllers/requestController';

jest.mock('../src/utils/authChecker');
jest.mock('../src/utils/testChecker');

describe('requestController', () => {
  let controller;
  let mockRequestModel;
  let mockMedicineModel;
  let mockSave;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockSort = jest.fn().mockResolvedValue([]);
    mockSave = jest.fn().mockResolvedValue(true);
    mockRequestModel = jest.fn().mockImplementation(() => ({ save: mockSave }));
    mockRequestModel.find = jest.fn(() => ({ sort: mockSort }));
    mockRequestModel.findOne = jest.fn().mockResolvedValue(null);
    mockRequestModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    mockRequestModel.findOneAndDelete = jest.fn().mockResolvedValue(null);

    mockMedicineModel = jest.fn().mockImplementation(() => ({ save: mockSave }));
    mockMedicineModel.find = jest.fn(() => ({ sort: mockSort }));
    mockMedicineModel.findOne = jest.fn().mockResolvedValue(null);
    mockMedicineModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    mockMedicineModel.findOneAndDelete = jest.fn().mockResolvedValue(null);

    // eslint-disable-next-line new-cap
    controller = new requestController(mockRequestModel);

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

  describe('requests', () => {
    it('return all requests if authorized', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'admin' });

      await controller.getAllRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('return no requestss if NOT authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getAllRequests(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    it('post a new request if authorized', async () => {
      req.headers.authorization = 'Bearer valid-token';
      authChecker.checkAuth.mockReturnValue({ username: 'admin' });
      testChecker.isTest.mockReturnValue(false);

      req.body = {
        medicinename: 'test',
        quantity: 1,
      };

      req.app.get.mockReturnValue({ publishEvent: jest.fn() });

      const mockNewRequestSave = jest.fn().mockResolvedValue(true);
      controller.requestModel = jest.fn().mockImplementation(() => ({ save: mockNewRequestSave }));

      await controller.postNewRequest(req, res);

      expect(mockNewRequestSave).toHaveBeenCalled();
      expect(req.app.get).toHaveBeenCalledWith('socketServer');
      expect(res.status).toHaveBeenCalledWith(201);
      // eslint-disable-next-line max-len
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.any(Object) }));
    });

    it('not post a new request if NOT authorized', async () => {
      req.headers.authorization = '';
      authChecker.checkAuth.mockReturnValue(null);
      testChecker.isTest.mockReturnValue(false);

      req.body = {
        medicinename: 'test',
        quantity: 1,
      };

      req.app.get.mockReturnValue({ publishEvent: jest.fn() });

      const mockNewRequestSave = jest.fn().mockResolvedValue(true);
      controller.requestModel = jest.fn().mockImplementation(() => ({ save: mockNewRequestSave }));

      await controller.postNewRequest(req, res);

      expect(mockSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User not logged in' }));
    });

    it('get user requests if authorized', async () => {
      const mockPayload = { username: 'admin' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);
      req.params = { username: 'admin' };

      const mockRequests = [{
        medicinename: 'test', quantity: 10, username: 'admin', status: 'Waiting for Review', timestamp: Date.now(),
      }];
      const mockSort = jest.fn().mockResolvedValue(mockRequests);
      mockRequestModel.find = jest.fn(() => ({ sort: mockSort }));

      await controller.getUserRequests(req, res);

      expect(mockRequestModel.find).toHaveBeenCalledWith({ username: 'admin' });
      expect(mockSort).toHaveBeenCalledWith({ timeStamp: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockRequests });
    });

    it('should successfully update the request status', async () => {
      const mockRequestId = '12345';
      const mockRequest = {
        _id: mockRequestId,
        medicinename: 'test',
        quantity: 10,
        username: 'admin',
        status: 'Waiting for Review',
        timestamp: Date.now(),
        save: jest.fn().mockResolvedValue(true),
      };

      req.params = { requestId: mockRequestId };
      req.body = { status: 'Rejected' };

      mockRequestModel.findById = jest.fn().mockResolvedValue(mockRequest);

      await controller.updateRequest(req, res);

      expect(mockRequest.status).toBe('Rejected');
      expect(mockRequest.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Request rejected successfully',
        request: mockRequest,
      });
    });
  });
});
