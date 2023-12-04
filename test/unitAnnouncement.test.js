import announcementController from '../src/controllers/announcementController';
import authChecker from '../src/utils/authChecker';
import testChecker from '../src/utils/testChecker';

// mock the dependencies
jest.mock('../src/utils/authChecker');
jest.mock('../src/utils/testChecker');

describe('announcementController', () => {
  let controller;
  let mockAnnouncementModel;
  let mockUserModel;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    mockAnnouncementModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockReturnThis(),
      isActive: true,
    };
    mockUserModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ username: 'user1', isActive: true }]),
    };

    // instance of the controller
    // eslint-disable-next-line new-cap
    controller = new announcementController(mockAnnouncementModel, mockUserModel);

    // mock req and res
    req = {
      headers: {},
      body: {},
      app: { get: jest.fn() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getLatestAnnouncements', () => {
    it('should return announcements if authorized', async () => {
      const mockPayload = { username: 'testUser' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.getLatestAnnouncements(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return announcements if not authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getLatestAnnouncements(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({
        success: true,
      }));
    });
  });

  describe('postNew', () => {
    // it('should post a new announcement if authorized and body is valid', async () => {
    //   const mockPayload = { username: 'testUser' };
    //   req.headers.authorization = 'Bearer sometoken';
    //   req.body.content = 'New Announcement';
    //   req.app.get.mockReturnValue({ publishEvent: jest.fn() });

    //   authChecker.checkAuth.mockReturnValue(mockPayload);
    //   testChecker.isTest.mockReturnValue(false);

    //   await controller.postNew(req, res);

    //   expect(mockAnnouncementModel.save).toHaveBeenCalled();
    //   expect(res.status).toHaveBeenCalledWith(201);
    //   expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    //     success: true,
    //   }));
    // });

    it('should return 401 if not logged in', async () => {
      await controller.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not logged in',
      }));
    });

    it('should return 400 if content is missing', async () => {
      req.headers.authorization = 'Bearer sometoken';
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });

      await controller.postNew(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid request',
      }));
    });
  });
});
