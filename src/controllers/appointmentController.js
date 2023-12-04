/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable max-len */
import authChecker from '../utils/authChecker.js';
import testChecker from '../utils/testChecker.js';

class appointmentController {
  // constructor
  constructor(appointmentModel, userModel) {
    this.appointmentModel = appointmentModel;
    this.userModel = userModel;
  }

  /**
   * Get all appointments
   */
  async getAllAppointments(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const appointments = await this.appointmentModel.find({}).populate('doctor patient');
    const data = appointments.map((appointment) => ({
      ...appointment.toObject(),
      doctorUsername: appointment.doctor.username,
      patientUsername: appointment.patient?.username || '',
    }));
    res.status(200).json({ success: true, appointments: data });
  }

  /**
   * Get a list of all appointments for a doctor regardless of it's booked or not for a specific date
   */
  async getDoctorAppointments(req, res) {
    const payload = authChecker.checkAuth(req, res);
    // console.log(payload);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const doctorUsername = payload.username.toLowerCase();
    const { date } = req.query;
    const doctor = await this.userModel.getIdByUsername(doctorUsername);
    const appointments = await this.appointmentModel.find({ doctor, date }).populate('doctor patient');
    const data = appointments.map((appointment) => ({
      ...appointment.toObject(),
      doctorUsername: appointment.doctor.username,
      patientUsername: appointment.patient?.username || '',
    }));
    res.status(200).json({ success: true, appointments: data });
  }

  /**
   * Get a list of time slots that hasn't been selected by the doctor yet on a date
   */
  async getDoctorTimeSlots(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const doctorUsername = payload.username.toLowerCase();
    const { date } = req.query;
    const doctor = await this.userModel.getIdByUsername(doctorUsername);
    const appointments = await this.appointmentModel.find({ doctor, date });
    // console.log(appointments);
    const selectedTimeSlots = [];
    appointments.forEach((appointment) => {
      selectedTimeSlots.push(appointment.startTime);
    });
    const availableTimeSlots = [];
    for (let i = 8; i < 18; i += 1) {
      if (!selectedTimeSlots.includes(i)) {
        availableTimeSlots.push(i);
      }
    }
    res.status(200).json({ success: true, timeslots: availableTimeSlots });
  }

  /**
   * Doctor add new availability for a date given doctorUsername as string, date as string, startTime as number
   */
  async addNewAvailability(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    try {
      const { date, startTimes } = req.body;
      const doctorUsername = payload.username.toLowerCase();
      const doctor = await this.userModel.getIdByUsername(doctorUsername);

      // Ensure startTimes is an array
      // console.log(startTimes);
      if (!Array.isArray(startTimes)) {
        res.status(400).json({ success: false, message: 'startTimes must be an array' });
        return;
      }

      // Create a new availability for each startTime provided
      const availabilities = await Promise.all(startTimes.map(async (startTime) => {
        const newAvailability = new this.appointmentModel({
          date,
          startTime,
          doctor,
          // patientUsername: '',
        });
        return newAvailability.save();
      }));

      const data = availabilities.map((appointment) => ({
        ...appointment.toObject(),
        doctorUsername,
        patientUsername: '',
      }));
      res.status(201).json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create new availabilities' });
    }
  }

  /**
   * Get a list of all appointments for a patient for a specific date
   */
  async getPatientAppointments(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const patientUsername = payload.username.toLowerCase();
    const patient = await this.userModel.getIdByUsername(patientUsername);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    const { date } = req.query;
    const appointments = await this.appointmentModel.find({ patient, date }).populate('doctor patient');
    const data = appointments.map((appointment) => ({
      ...appointment.toObject(),
      doctorUsername: appointment.doctor.username,
      patientUsername,
    }));
    res.status(200).json({ success: true, appointments: data });
  }

  /**
   * Get a list of all doctors and their vacant availabilities on a specific date for that day, that means the patientUsername is empty
   * It should return the doctor names as well as their available time slots
   */
  async getDoctorsAvailability(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const { date } = req.query;
    const appointments = await this.appointmentModel.find({ date, patient: { $exists: 0 } }).populate('doctor');
    const doctorsAvailability = new Map();

    appointments.forEach((appointment) => {
      if (!doctorsAvailability.has(appointment.doctor.username)) {
        doctorsAvailability.set(appointment.doctor.username, [appointment.startTime]);
      } else {
        doctorsAvailability.get(appointment.doctor.username).push(appointment.startTime);
      }
    });

    // Convert the Map to an array of objects
    const doctors = Array.from(doctorsAvailability, ([doctorUsername, availableTimes]) => ({ doctorUsername, availableTimes }));

    res.status(200).json({ success: true, doctors });
  }

  /**
   * Patient book an appointment given doctorUsername as string, date as string, startTime as number, and patientUsername as string
   */
  async addNewAppointment(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const {
      date, startTime, doctorUsername,
    } = req.body;

    const patientUsername = payload.username.toLowerCase();

    const doctor = await this.userModel.getIdByUsername(doctorUsername);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }
    const patient = await this.userModel.getIdByUsername(patientUsername);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    // console.log(patientUsername);
    try {
      const appointment = await this.appointmentModel.findOne({
        date,
        startTime,
        doctor,
        patient: { $exists: 0 },
      });

      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not available.' });
        return;
      }
      appointment.patient = patient;
      await appointment.save();
      res.status(200).json({ success: true, message: 'Appointment booked successfully.' });
    } catch (error) {
      // console.error('Error booking appointment:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Patient cancel an appointment given doctorUsername as string, date as string, startTime as number, and patientUsername as string
   * However, this shouldn't delete the entire item, it should just set the patientUsername to empty string
   */
  async deleteAppointment(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const {
      date, startTime, doctorUsername,
    } = req.query;

    const patientUsername = payload.username.toLowerCase();

    const doctor = await this.userModel.getIdByUsername(doctorUsername);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }
    const patient = await this.userModel.getIdByUsername(patientUsername);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    try {
      const appointment = await this.appointmentModel.findOne({
        date,
        startTime,
        doctor,
        patient,
      });

      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or not booked by this patient.' });
        return;
      }

      appointment.patient = undefined;
      await appointment.save();

      res.status(200).json({ success: true, message: 'Appointment canceled successfully.' });
    } catch (error) {
      // console.error('Error canceling appointment:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  /**
   * Patient update an existing appointment given patientUsername as string, date_old and date_new as string,
   * startTime_new and startTime_old as number, and doctorUsername_old and doctorUsername_new as string
   */
  async updateAppointment(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const {
      dateOld, startTimeOld, doctorUsernameOld, dateNew, startTimeNew, doctorUsernameNew,
    } = req.body;

    const patientUsername = payload.username.toLowerCase();

    const doctorOld = await this.userModel.getIdByUsername(doctorUsernameOld);
    if (!doctorOld) {
      res.status(404).json({ success: false, message: 'Old doctor not found.' });
      return;
    }
    const doctorNew = await this.userModel.getIdByUsername(doctorUsernameNew);
    if (!doctorNew) {
      res.status(404).json({ success: false, message: 'New doctor not found.' });
      return;
    }
    const patient = await this.userModel.getIdByUsername(patientUsername);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }

    try {
      const targetAppointment = await this.appointmentModel.findOne({
        date: dateNew,
        startTime: startTimeNew,
        doctor: doctorNew,
        patient: { $exists: 0 },
      });

      if (!targetAppointment) {
        res.status(400).json({ success: false, message: 'Targeted appointment slot is not available.' });
        return;
      }

      targetAppointment.patient = patient;
      await targetAppointment.save();

      await this.appointmentModel.findOneAndUpdate(
        {
          date: dateOld, startTime: startTimeOld, doctor: doctorOld, patient,
        },
        { $unset: { patient: 1 } },
        { new: true },
      );

      const data = {
        ...targetAppointment.toObject(),
        doctorUsername: doctorUsernameNew,
        patientUsername,
      };

      res.status(200).json({ success: true, updatedAppointment: data });
    } catch (error) {
      // console.error('Error updating appointment:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}
export default appointmentController;
