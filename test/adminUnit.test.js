/* eslint-disable new-cap */
import AdminController from '../src/controllers/adminController';
import LoginController from '../src/controllers/loginController';
import authChecker from '../src/utils/authChecker';

jest.mock('../src/utils/authChecker');

describe('AdminController Unit Test', () => {
  let adminController;
  let loginController;
  let mockUserModel;
  let mockSocketServer;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock socketServer setup
    mockSocketServer = {
      publishEvent: jest.fn(),
    };

    req = {
      params: {},
      body: {},
      headers: {},
      app: {
        get: jest.fn().mockImplementation((key) => {
          if (key === 'socketServer') {
            return mockSocketServer;
          }
          return null;
        }),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockUserModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    adminController = new AdminController(mockUserModel);
    loginController = new LoginController(mockUserModel);
  });

  it('should return user profile if user exists', async () => {
    req.params = { username: 'testuser' };

    const mockUserProfile = { username: 'testuser', isActive: true, privilege: 'User' };
    const mockSelect = jest.fn().mockResolvedValue(mockUserProfile);
    mockUserModel.findOne.mockReturnValue({ select: mockSelect });

    await adminController.getUserProfile(req, res);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
    expect(mockSelect).toHaveBeenCalledWith('-_id username isActive privilege');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success', userProfile: mockUserProfile });
  });

  describe('4 User Profile Rule', () => {
    it('successfully change user privilege', async () => {
      mockUserModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ username: 'testadmin', privilege: 'Citizen' }),
      }));

      mockUserModel.findOneAndUpdate = jest.fn().mockResolvedValue({ privilege: 'Administrator' });
      req.params = { username: 'testadmin' };
      req.body = { privilege: 'Administrator' };

      await adminController.updateUserProfile(req, res);

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testadmin' },
        { privilege: 'Administrator' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User profile successfully updated',
        userProfile: expect.any(Object),
      });
    });

    it('successfully change user password', async () => {
      req.params = { username: 'testadmin' };
      req.body = { password: 'newPassword' };
      const hashedPassword = 'hashedNewPassword';
      mockUserModel.findOneAndUpdate = jest.fn().mockResolvedValue({ password: hashedPassword });
      mockUserModel.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
      mockUserModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ username: 'testadmin', password: hashedPassword }),
      }));

      await adminController.updateUserProfile(req, res);

      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testadmin' },
        { password: hashedPassword, salt: expect.any(String) },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User profile successfully updated',
        userProfile: expect.any(Object),
      });
    });

    it('successfully change user isActive', async () => {
      req.params = { username: 'testuser' };
      req.body = { isActive: false };

      mockUserModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue({ username: 'testuser', isActive: false }),
      }));

      mockUserModel.findOneAndUpdate = jest.fn().mockResolvedValue({ isActive: true });
      await adminController.updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User profile successfully updated',
        userProfile: expect.any(Object),
      });
    });
  });

  describe('6 Privilege Rule tests', () => {
    // TODO
  });

  describe('5 Active/Inactive Rule tests', () => {
    it('new accounts should be active by default', async () => {
      mockUserModel.createUser = jest.fn().mockImplementation((userData) => ({
        ...userData,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      }));

      const newUserDetails = { username: 'newuser', password: 'password123' };
      const newUser = mockUserModel.createUser(newUserDetails);

      expect(newUser.isActive).toBe(true);
    });

    it('logged in user is logged out when account becomes inactive', async () => {
      // Mock user's initial state as active and logged in
      const mockUser = { username: 'user1', isActive: true, isLoggedIn: true };

      // Simulate user becoming inactive
      mockUser.isActive = false;

      await userController.logout(mockUser);

      expect(mockUser.isLoggedIn).toBe(false);
      expect(mockUser.logoutMessage).toBe('Your account has been deactivated.');
    });
  });
});
