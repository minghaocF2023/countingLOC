// /* eslint-disable max-len */
import authChecker from '../src/utils/authChecker';
import testChecker from '../src/utils/testChecker';
import appointmentController from '../src/controllers/appointmentController';

jest.mock('../src/utils/authChecker');
jest.mock('../src/utils/testChecker');

describe('appointmentController', () => {
  let controller;
  let mockAppointmentModel;
  let mockSave;
  let req;
  let res;

  beforeEach(() => {
    jest.resetAllMocks();
    mockSave = jest.fn().mockResolvedValue(true);
    mockAppointmentModel = jest.fn().mockImplementation(() => ({ save: mockSave }));
    mockAppointmentModel.find = jest.fn().mockResolvedValue([]);
    mockAppointmentModel.findOne = jest.fn().mockResolvedValue(null);
    mockAppointmentModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);

    // eslint-disable-next-line new-cap
    controller = new appointmentController(mockAppointmentModel, {});

    req = {
      headers: {},
      body: {},
      query: {},
      app: { get: jest.fn() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  /**
   * Test the getDoctorAppointments function
   */
  describe('getAllAppointments', () => {
    it('should return all appointments if authorized', async () => {
      const mockPayload = { username: 'testUser' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.getAllAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return appointments if not authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getAllAppointments(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  /**
   * Test the getDoctorTimeSlots function
   */
  describe('getDoctorTimeSlots', () => {
    it('should return all time slots if authorized', async () => {
      const mockPayload = { username: 'testUser' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.getDoctorTimeSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return time slots if not authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getDoctorTimeSlots(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  describe('addNewAvailability', () => {
    it('should add a new availability if authorized', async () => {
      const mockPayload = { username: 'testdoctor1' };
      req.body = {
        date: '2023-11-20',
        startTimes: [9],
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.addNewAvailability(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    it('should not add a new availability if not authorized', async () => {
      req.body = {
        date: '2023-11-16',
        startTimes: [10],
      };
      authChecker.checkAuth.mockReturnValue(null);

      await controller.addNewAvailability(req, res);

      expect(mockSave).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(201);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  /**
   * Test the getPatientAppointments function
   */
  describe('getPatientAppointments', () => {
    it('should return all appointments if authorized', async () => {
      const mockPayload = { username: 'testUser' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.getPatientAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return appointments if not authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getPatientAppointments(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  /**
   * Test the getDoctorsAvailability function
   */
  describe('getDoctorsAvailability', () => {
    it('should return all appointments if authorized', async () => {
      const mockPayload = { username: 'testUser' };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      testChecker.isTest.mockReturnValue(false);

      await controller.getDoctorsAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return appointments if not authorized', async () => {
      authChecker.checkAuth.mockReturnValue(null);

      await controller.getDoctorsAvailability(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });
  });

  /**
   * Test the addNewAppointment function
   */
  describe('addNewAppointment', () => {
    it('should add a new appointment if available and authorized', async () => {
      const mockPayload = { username: 'testpatient' };
      req.body = {
        date: '2023-11-20',
        startTime: 9,
        doctorUsername: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValue({ save: mockSave });

      await controller.addNewAppointment(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Appointment booked successfully.',
        }),
      );
    });

    it('should not add a new appointment if not available', async () => {
      const mockPayload = { username: 'testpatient' };
      req.body = {
        date: '2023-11-20',
        startTime: 9,
        doctorUsername: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValue(null);

      await controller.addNewAppointment(req, res);

      expect(mockSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Appointment not available.',
        }),
      );
    });
  });

  /**
   * Test the deleteAppointment function
   */
  describe('deleteAppointment', () => {
    it('should cancel an appointment if found and authorized', async () => {
      const mockPayload = { username: 'testpatient' };
      req.query = {
        date: '2023-11-20',
        startTime: 9,
        doctorUsername: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValue({ save: mockSave });

      await controller.deleteAppointment(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Appointment canceled successfully.',
        }),
      );
    });

    it('should not cancel an appointment if not found or not authorized', async () => {
      const mockPayload = { username: 'testpatient' };
      req.query = {
        date: '2023-11-20',
        startTime: 9,
        doctorUsername: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValue(null);

      await controller.deleteAppointment(req, res);

      expect(mockSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Appointment not found or not booked by this patient.',
        }),
      );
    });
  });

  /**
   * Test the updateAppointment function
   */
  describe('updateAppointment', () => {
    it('should update an appointment if target slot is available and authorized', async () => {
      const mockPayload = { username: 'testpatient' };
      req.body = {
        dateOld: '2023-11-20',
        startTimeOld: 9,
        doctorUsernameOld: 'testdoctor',
        dateNew: '2023-11-21',
        startTimeNew: 10,
        doctorUsernameNew: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValueOnce({ save: mockSave });
      mockAppointmentModel.findOneAndUpdate.mockResolvedValue(true);

      await controller.updateAppointment(req, res);

      expect(mockSave).toHaveBeenCalled();
      expect(mockAppointmentModel.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        }),
      );
    });

    it('should not update an appointment if target slot is not available', async () => {
      const mockPayload = { username: 'testpatient' };
      req.body = {
        dateOld: '2023-11-20',
        startTimeOld: 9,
        doctorUsernameOld: 'testdoctor',
        dateNew: '2023-11-21',
        startTimeNew: 10,
        doctorUsernameNew: 'testdoctor',
      };
      authChecker.checkAuth.mockReturnValue(mockPayload);
      mockAppointmentModel.findOne.mockResolvedValueOnce(null); // No target appointment available

      await controller.updateAppointment(req, res);

      expect(mockSave).not.toHaveBeenCalled();
      expect(mockAppointmentModel.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Targeted appointment slot is not available.',
        }),
      );
    });
  });
});
