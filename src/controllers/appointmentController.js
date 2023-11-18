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
    const appointments = await this.appointmentModel.find({});
    res.status(200).json({ success: true, appointments });
  }

  /**
     * Get a list of all appointments for a doctor regardless of it's booked or not for a specific date
     */
  async getDoctorAppointments(req, res) {
    const payload = authChecker.checkAuth(req, res);
    if (payload === null) {
      return;
    }
    if (testChecker.isTest(res, payload)) {
      return;
    }
    const { doctorUsername } = req.query;
    const { date } = req.query;
    const appointments = await this.appointmentModel.find({ doctorUsername, date });
    console.log(appointments);
    res.status(200).json({ success: true, appointments });
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
    const { doctorUsername } = req.query;
    const { date } = req.query;
    const appointments = await this.appointmentModel.find({ doctorUsername, date });
    console.log(appointments);
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
      const { date, startTime, doctorUsername } = req.body;
      const newAvailability = {
        date,
        startTime,
        doctorUsername: doctorUsername || payload.username, // fallback to authenticated user if not provided
        patientUsername: '', // No patient since this is a new availability
      };
      const availability = new this.appointmentModel(newAvailability);
      await availability.save();
      res.status(201).json({ success: true, data: availability });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, message: 'Invalid data provided' });
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
    const { patientUsername } = req.query;
    const { date } = req.query;
    const appointments = await this.appointmentModel.find({ patientUsername, date });
    res.status(200).json({ success: true, appointments });
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
    const appointments = await this.appointmentModel.find({ date, patientUsername: '' });

    const doctorsAvailability = new Map();

    appointments.forEach((appointment) => {
      if (!doctorsAvailability.has(appointment.doctorUsername)) {
        doctorsAvailability.set(appointment.doctorUsername, [appointment.startTime]);
      } else {
        doctorsAvailability.get(appointment.doctorUsername).push(appointment.startTime);
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
      date, startTime, doctorUsername, patientUsername,
    } = req.body;

    try {
      const appointment = await this.appointmentModel.findOne({
        date,
        startTime,
        doctorUsername,
        patientUsername: '',
      });

      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not available.' });
        return;
      }
      appointment.patientUsername = patientUsername;
      await appointment.save();
      res.status(200).json({ success: true, message: 'Appointment booked successfully.' });
    } catch (error) {
      console.error('Error booking appointment:', error);
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
      date, startTime, doctorUsername, patientUsername,
    } = req.query;

    try {
      const appointment = await this.appointmentModel.findOne({
        date,
        startTime,
        doctorUsername,
        patientUsername,
      });

      if (!appointment) {
        res.status(404).json({ success: false, message: 'Appointment not found or not booked by this patient.' });
        return;
      }

      appointment.patientUsername = '';
      await appointment.save();

      res.status(200).json({ success: true, message: 'Appointment canceled successfully.' });
    } catch (error) {
      console.error('Error canceling appointment:', error);
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
      dateOld, startTimeOld, doctorUsernameOld, patientUsername, dateNew, startTimeNew, doctorUsernameNew,
    } = req.body;

    try {
      const targetAppointment = await this.appointmentModel.findOne({
        date: dateNew,
        startTime: startTimeNew,
        doctorUsername: doctorUsernameNew,
        patientUsername: '',
      });

      if (!targetAppointment) {
        res.status(400).json({ success: false, message: 'Targeted appointment slot is not available.' });
        return;
      }

      targetAppointment.patientUsername = patientUsername;
      await targetAppointment.save();

      await this.appointmentModel.findOneAndUpdate(
        {
          date: dateOld, startTime: startTimeOld, doctorUsername: doctorUsernameOld, patientUsername,
        },
        { patientUsername: '' },
        { new: true },
      );

      res.status(200).json({ success: true, updatedAppointment: targetAppointment });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}
export default appointmentController;
