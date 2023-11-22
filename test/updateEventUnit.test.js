import UpdateEventController from '../src/controllers/updateEventController.js';
import authChecker from '../src/utils/authChecker.js';

jest.mock('../src/utils/authChecker');

describe('UpdateEventController Unit Test', () => {
  let mockEvent;
  let mockEvent2;
  let mockEvent3;
  let mockReq;
  let mockRes;
  let mockEventModel;
  let mockUpdateEventController;

  beforeEach(() => {
    mockEvent = {
      title: 'Flood',
      description: 'Flood in the city',
      timestamp: 1622512800000,
      location: 'Mountain View, CA 94043, US',
      severity: 1,
      range_affected: '5 miles',
    };

    mockEvent2 = {
      title: 'Flood',
      description: 'Flood in the city',
      timestamp: 1622512802300,
      location: '123 Mountain View, CA 94043, US',
      severity: 1,
      range_affected: '3 miles',
    };

    mockEvent3 = {
      title: undefined,
      description: 'Flood in the city',
      timestamp: 1622512802300,
      location: undefined,
      severity: 1,
      range_affected: '3 miles',
    };

    mockReq = {
      headers: {},
      params: { id: '123' },
      body: mockEvent,
    };

    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    mockEventModel = {
      get: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockUpdateEventController = new UpdateEventController(mockEventModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmergencyEvent', () => {
    it('should get one event', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(mockEvent);
      await mockUpdateEventController.getEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OK', event: mockEvent });
    });

    it('should return 404 if not found', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(null);
      await mockUpdateEventController.getEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Event Not Found' });
    });
  });

  describe('updateEmergencyEvent', () => {
    it('should update event if exist', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(mockEventModel);
      mockEventModel.update.mockResolvedValue(mockEvent2);
      await mockUpdateEventController.updateEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OK', event: mockEvent2 });
    });

    it('should return 400 if missing required fields for update', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      await mockUpdateEventController.updateEmergencyEvent({
        ...mockReq,
        body: mockEvent3,
      }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid request' });
    });

    it('should return 404 if not found for update', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(null);
      await mockUpdateEventController.updateEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Event Not Found' });
    });
  });

  describe('deleteEmergencyEvent', () => {
    it('should delete event if exist', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(mockEventModel);
      mockEventModel.delete.mockResolvedValue(undefined);
      await mockUpdateEventController.deleteEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OK' });
    });

    it('should return 404 if not found for delete', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockEventModel.getById.mockResolvedValue(null);
      await mockUpdateEventController.deleteEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Event Not Found' });
    });
  });
});
