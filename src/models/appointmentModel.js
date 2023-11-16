import mongoose from 'mongoose';

const appointmentFactory = (connection) => {
  if (connection.models.Appointment) {
    return connection.models.Appointment;
  }
  const AppointmentSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // "HH:mm" format would be better than int for time
      required: true,
    },
    endTime: {
      type: String, // To enforce the 1-hour duration rule, we calculate endTime based on startTime
      required: true,
    },
    doctorUsername: {
      type: String,
      required: true,
    },
    patientUsername: {
      type: String,
      required: false,
      default: '',
    },
    status: {
      type: String,
      enum: ['booked', 'available'], // To differentiate between booked appointments and available slots
      required: true,
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
     * Get all announcement
     * @param {mongoose.FilterQuery<Announcement>} filter
     * @param {mongoose.ProjectionType<Announcement>?=} projection
     * @param {mongoose.QueryOptions<Announcement>?=} options
     * @returns {Promise<Announcement[]>} array of announcements
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((announcements) => announcements.map((pm) => new Appointment(pm)));
    }

    getContent() {
      return this.content;
    }

    getSenderName() {
      return this.senderName;
    }

    getTimestamp() {
      return this.timestamp;
    }

    static async createAnnouncment(data) {
      const newAnnouncement = new this(data);
      await newAnnouncement.save();
      return newAnnouncement;
    }

    /**
     * Get all messages from the database
     * @returns {Promise<Announcement[]>} A promise that resolves to an array of Announcements
     */
    static async getAllAnnouncements() {
      // eslint-disable-next-line max-len
      return this.find({}).then((announcements) => announcements.map((msg) => new Appointment(msg)));
    }
  }

  return Appointment;
};

export default appointmentFactory;
