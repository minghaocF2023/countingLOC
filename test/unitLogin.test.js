import dotenv from 'dotenv';
import JWT from '../src/utils/jwt';
import testChecker from '../src/utils/testChecker';
import authChecker from '../src/utils/authChecker';
import LoginController from '../src/controllers/loginController';

dotenv.config();

jest.mock('../src/utils/jwt');
jest.mock('../src/utils/testChecker');
jest.mock('../src/utils/authChecker');

describe('LoginController', () => {
  let controller;
  let req;
  let res;
  let mockUserModel;
  let mockSocketServer;

  beforeAll(() => {
    mockUserModel = {
      validate: jest.fn(),
      getOne: jest.fn(),
    };

    mockSocketServer = {
      publishEvent: jest.fn(),
    };

    JWT.mockImplementation(() => ({
      generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
    }));

    controller = new LoginController(mockUserModel);
  });

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      headers: {},
      app: {
        get: jest.fn(() => mockSocketServer),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      req.params.username = 'testuser';
      req.body.password = 'password';
      mockUserModel.validate.mockResolvedValue(true);

      await controller.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OK',
        token: 'mock-jwt-token',
      });
    });

    it('should return an error if username or password is missing', async () => {
      req.params.username = '';
      req.body.password = '';

      await controller.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid request',
      });
    });

    it('should return an error if username/password validation fails', async () => {
      req.params.username = 'testuser';
      req.body.password = 'wrongpassword';
      mockUserModel.validate.mockResolvedValue(false);

      await controller.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Incorrect username/password',
      });
    });
  });

  describe('updateOnlineStatus', () => {
    it('should update the online status of a user', async () => {
      req.params.username = 'testuser';
      authChecker.checkAuth.mockReturnValue({ username: 'testuser' });

      mockUserModel.getOne.mockResolvedValue({
        username: 'testuser',
        setOnline: jest.fn().mockResolvedValue({}),
        status: 'OK',
      });

      await controller.updateOnlineStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'OK',
      });
      expect(mockSocketServer.publishEvent).toHaveBeenCalledWith('userOnlineStatus', expect.any(Object));
    });
  });
});
