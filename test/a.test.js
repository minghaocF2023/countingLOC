/* eslint-disable new-cap */
import AdminController from '../src/controllers/adminController';
import LoginController from '../src/controllers/loginController';
import UserController from '../src/controllers/userController';
import announcementController from '../src/controllers/announcementController';
import authChecker from '../src/utils/authChecker';

jest.mock('../src/utils/authChecker');

describe('AdminController Unit Test', () => {
  let adminController;
  let userController;
  let loginController;
  let announcementcontroller;
  let mockUserModel;
  let mockAnnouncementModel;
  let mockSocketServer;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mock socketServer setup
    mockSocketServer = {
      publishEvent: jest.fn(),
      sendToPrivate: jest.fn(),
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
      find: jest.fn(),
      get: jest.fn(),
      getOne: jest.fn(),
      exec: jest.fn().mockResolvedValue(),
    };

    mockAnnouncementModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn(),
      exec: jest.fn(),
    };

    const mockProfileModel = {

    };

    mockUserModel.find.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([
        { username: 'activeUser', isActive: true },
        // Add other mock users as needed
      ]),
    }));

    adminController = new AdminController(mockUserModel);
    loginController = new LoginController(mockUserModel);
    userController = new UserController(mockUserModel, mockProfileModel);
    announcementcontroller = new announcementController(mockAnnouncementModel, mockUserModel);
  });

  it('Test which return user profile if user exists', async () => {
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

    it('Test that prevents admin to change user status', async () => {
      req.body = { username: 'testuser', newStatus: 'Help' };
      await adminController.updateUserEmergencyStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Admins do not have the right to change user status',
      });
    });
  });

  describe('6 Privilege Rule tests', () => {
    it('Test updating user privilege to Administrator', async () => {
      req.params = { username: 'testuser' };
      req.body = { privilege: 'Administrator' };
      mockUserModel.findOneAndUpdate.mockResolvedValue({ privilege: 'Administrator' });
      const mockSelect = jest.fn().mockResolvedValue({ username: 'testuser', isActive: true, privilege: 'Administrator' });
      mockUserModel.findOne.mockImplementation(() => ({ select: mockSelect }));
      await adminController.updateUserProfile(req, res);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        { privilege: 'Administrator' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User profile successfully updated',
        userProfile: expect.any(Object),
      });
    });
    it('Test updating user privilege to Citizen', async () => {
      req.params = { username: 'testuser' };
      req.body = { privilege: 'Citizen' };
      mockUserModel.findOneAndUpdate.mockResolvedValue({ privilege: 'Citizen' });
      const mockSelect = jest.fn().mockResolvedValue({ username: 'testuser', isActive: true, privilege: 'Citizen' });
      mockUserModel.findOne.mockImplementation(() => ({ select: mockSelect }));
      mockUserModel.find.mockResolvedValue([{ username: 'otheradmin', privilege: 'Administrator' }]);
      await adminController.updateUserProfile(req, res);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        { privilege: 'Citizen' },
      );
      expect(mockSelect).toHaveBeenCalledWith('-_id username isActive privilege');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.anything());
    });
    it('Test updating privilege without changing the existing privilege', async () => {
      req.params = { username: 'testuser' };
      req.body = { privilege: 'Administrator' };
      mockUserModel.findOneAndUpdate.mockResolvedValue({ privilege: 'Administrator' });
      const mockSelect = jest.fn().mockResolvedValue({ username: 'testuser', isActive: true, privilege: 'Administrator' });
      mockUserModel.findOne.mockImplementation(() => ({ select: mockSelect }));
      await adminController.updateUserProfile(req, res);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        { privilege: 'Administrator' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.anything());
    });
    it('Test updating privilege of a non-existing user', async () => {
      req.params = { username: 'nonexistentuser' };
      req.body = { privilege: 'Administrator' };
      mockUserModel.findOneAndUpdate.mockResolvedValue(null);
      await adminController.updateUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
    it('Test privilege update with valid privilege and additional non-privilege data', async () => {
      req.params = { username: 'testuser' };
      req.body = { privilege: 'Citizen', unrelatedField: 'someValue' };
      const mockSelect = jest.fn().mockResolvedValue({ username: 'testuser', isActive: true, privilege: 'Citizen' });
      mockUserModel.findOne.mockImplementation(() => ({ select: mockSelect }));
      mockUserModel.find.mockResolvedValue([{ username: 'anotheradmin', privilege: 'Administrator' }, { username: 'testuser', privilege: 'Citizen' }]);
      mockUserModel.findOneAndUpdate.mockResolvedValue({ privilege: 'Citizen', unrelatedField: 'someValue' });
      await adminController.updateUserProfile(req, res);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'testuser' },
        expect.objectContaining({ privilege: 'Citizen', unrelatedField: 'someValue' }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.anything());
    });
    it('Test promoting a user from Citizen to Coordinator', async () => {
      req.params = { username: 'citizenuser' };
      req.body = { privilege: 'Coordinator' };
      mockUserModel.findOneAndUpdate.mockResolvedValue({ username: 'citizenuser', privilege: 'Coordinator' });
      const mockSelect = jest.fn().mockResolvedValue({ username: 'citizenuser', isActive: true, privilege: 'Coordinator' });
      mockUserModel.findOne.mockImplementation(() => ({ select: mockSelect }));
      await adminController.updateUserProfile(req, res);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: 'citizenuser' },
        { privilege: 'Coordinator' },
      );
      expect(mockSelect).toHaveBeenCalledWith('-_id username isActive privilege');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User profile successfully updated',
        userProfile: expect.any(Object),
      });
    });
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
    // Negative test
    it('inactive users login attempt should fail', async () => {
      const inactiveUser = { username: 'inactiveUser', password: 'password', isActive: false };
      mockUserModel.getOne = jest.fn().mockResolvedValue(inactiveUser);
      mockUserModel.validate = jest.fn().mockReturnValue(true);
      req.body = { username: 'inactiveUser', password: 'password' };
      req.params = { username: 'inactiveUser' };
      await loginController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });
    it('active users login attempt should succeed', async () => {
      const inactiveUser = { username: 'activeUser', password: 'password', isActive: true };
      mockUserModel.getOne = jest.fn().mockResolvedValue(inactiveUser);
      mockUserModel.validate = jest.fn().mockReturnValue(true);
      req.body = { username: 'activeUser', password: 'password' };
      req.params = { username: 'activeUser' };
      await loginController.loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    it('Test user information visible to others when their account isActive', async () => {
      req.params = { username: 'onlineUser' };
      mockUserModel.findOne.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(
          {
            username: 'onlineUser', isOnline: true, isActive: true, status: 'OK',
          },
        ),
      }));
      await adminController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Success',
        userProfile: {
          isActive: true,
          username: 'onlineUser',
          isOnline: true,
          status: 'OK',
        },
      });
    });

    it('Test that inactive users will not show up to non-administrators', async () => {
      const mockUsers = [
        {
          username: 'activeUser', isActive: true, isOnline: true, status: 'OK',
        },
        {
          username: 'inactiveUser', isActive: false, isOnline: false, status: 'OK',
        },
      ];
      mockUserModel.get.mockResolvedValue(mockUsers);
      const nonAdminPayload = { username: 'nonAdminUser', privilege: 'Citizen' };
      authChecker.checkAuth.mockReturnValue(nonAdminPayload);
      mockUserModel.getOne.mockResolvedValue({ privilege: 'Citizen', _id: 'nonAdminUserId' });
      await userController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({
            username: 'activeUser',
            isOnline: true,
            status: 'OK',
          }),
        ]),
      }));
      expect(res.json.mock.calls[0][0].users).not.toContainEqual(
        expect.objectContaining({ username: 'inactiveUser' }),
      );
    });
  });
});
