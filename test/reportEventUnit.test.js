import ReportEventController from '../src/controllers/reportEventController.js';
import authChecker from '../src/utils/authChecker.js';

jest.mock('../src/utils/authChecker');

describe('ReportEventController Unit Test', () => {
  let mockEvent;
  let mockReq;
  let mockRes;
  let mockReportEventModel;
  let mockReportEventController;

  beforeEach(() => {
    mockEvent = {
      title: 'Flood',
      description: 'Flood in the city',
      timestamp: 1622512800000,
      location: 'Mountain View, CA 94043, US',
      severity: 1,
      range_affected: '5 miles',
    };

    mockReq = {
      headers: {},
      body: mockEvent,
    };

    mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    mockReportEventModel = {
      get: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockReportEventController = new ReportEventController(mockReportEventModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmergencyEvents', () => {
    it('should get all events', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockReportEventModel.get.mockResolvedValue([mockEvent]);
      await mockReportEventController.getEmergencyEvents(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OK', events: [mockEvent] });
    });
  });

  describe('createEmergencyEvent', () => {
    it('should create new event', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      mockReportEventModel.create.mockResolvedValue(mockEvent);
      await mockReportEventController.createEmergencyEvent(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'OK', event: mockEvent });
    });

    it('should return 400 if missing required fields', async () => {
      authChecker.checkAuth.mockReturnValue({ username: 'testUser' });
      await mockReportEventController.createEmergencyEvent({ body: {} }, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid request' });
    });
  });
});
