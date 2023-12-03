import mongoose from 'mongoose';

const AnnouncementFactory = (connection) => {
  if (connection.models.Announcement) {
    return connection.models.Announcement;
  }
  const AnnouncementSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
    },
    // senderName: {
    //   type: String,
    //   // required: true,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now(),
    },
  });

  let AnnouncementModel;
  if (connection.models.Announcement) {
    AnnouncementModel = connection.models.Announcement;
  } else {
    AnnouncementModel = connection.model('Announcement', AnnouncementSchema);
  }

  class Announcement extends AnnouncementModel {
    /**
     * Get all announcement
     * @param {mongoose.FilterQuery<Announcement>} filter
     * @param {mongoose.ProjectionType<Announcement>?=} projection
     * @param {mongoose.QueryOptions<Announcement>?=} options
     * @returns {Promise<Announcement[]>} array of announcements
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((announcements) => announcements.map((pm) => new Announcement(pm)));
    }

    getContent() {
      return this.content;
    }

    getSender() {
      return this.populate('sender').sender;
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
      return this.find({}).then((announcements) => announcements.map((msg) => new Announcement(msg)));
    }
  }

  return Announcement;
};

export default AnnouncementFactory;
