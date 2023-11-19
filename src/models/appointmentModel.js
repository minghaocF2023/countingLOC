import mongoose from 'mongoose';

const appointmentFactory = (connection) => {
  if (connection.models.Appointment) {
    return connection.models.Appointment;
  }
  const AppointmentSchema = new mongoose.Schema({
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    doctorUsername: {
      type: String,
      required: true,
    },
    patientUsername: {
      type: String,
      required() {
        return this.patientUsername !== '';
      },
      default: '',
    },
  });

  let AppointmentModel;
  if (connection.models.Appointment) {
    AppointmentModel = connection.models.Appointment;
  } else {
    AppointmentModel = connection.model('Appointment', AppointmentSchema);
  }

  class Appointment extends AppointmentModel {
    /**
     * Get all appointments
     * @param {mongoose.FilterQuery<Appointments>} filter
     * @param {mongoose.ProjectionType<Appointments>?=} projection
     * @param {mongoose.QueryOptions<Appointments>?=} options
     * @returns {Promise<Appointments[]>} array of appointments
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((appointments) => appointments.map((pm) => new Appointment(pm)));
    }

    getDate() {
      return this.date;
    }

    getStartTime() {
      return this.startTime;
    }

    getDoctorUsername() {
      return this.doctorUsername;
    }

    getPatientUsername() {
      return this.patientUsername;
    }

    setDate(date) {
      this.date = date;
    }

    setStartTime(startTime) {
      this.startTime = startTime;
    }

    setDoctorUsername(doctorUsername) {
      this.doctorUsername = doctorUsername;
    }

    setPatientUsername(patientUsername) {
      this.patientUsername = patientUsername;
    }

    static async createAppointment(data) {
      const newAppointment = new this(data);
      await newAppointment.save();
      return newAppointment;
    }

    /**
     * Get all appointments from the database
     * @returns {Promise<Appointment[]>} A promise that resolves to an array of Appointments
     */
    static async getAllAppointments() {
      // eslint-disable-next-line max-len
      return this.find({}).then((appointments) => appointments.map((msg) => new Appointment(msg)));
    }
  }

  return Appointment;
};

export default appointmentFactory;
