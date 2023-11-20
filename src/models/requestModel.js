import mongoose from 'mongoose';

// eslint-disable-next-line no-underscore-dangle
// const filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle

/**
 * Medicine class factory using given database connection
 *
 * @param {mongoose} mongoose database connection
 * @returns Medicine class
 */
const RequestFactory = (connection) => {
  // console.log(connection);
  const RequestSchema = new mongoose.Schema({
    medicinename: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Waiting for Review',
      enum: ['Approved', 'Rejected', 'Waiting for Review'],
    },
    timestamp: {
      type: Number,
      required: true,
      default: Date.now(),
    },
  });

  let RequestModel;
  if (connection.models.Request) {
    RequestModel = connection.models.Request;
  } else {
    RequestModel = connection.model('Request', RequestSchema);
  }

  class Request extends RequestModel {
    // static BANNED_USERNAMES = JSON.parse(fs.readFileSync(FILE_PATH));

    /**
     * Get all users
     * @param {mongoose.FilterQuery<User>} filter
     * @param {mongoose.ProjectionType<User>?=} projection
     * @param {mongoose.QueryOptions<User>?=} options
     * @returns {Promise<User[]>} array of users
     */
    static async get(filter, projection, options) {
      return this.find(filter, projection, options)
        .then((requests) => requests.map((request) => new Request(request)));
    }

    /**
     * Get one medicine
     * @param {mongoose.FilterQuery<User>?} filter
     * @param {mongoose.ProjectionType<User>?=} projection
     * @param {mongoose.QueryOptions<User>?=} options
     * @returns {Promise<User | null>} user
     */
    static async getOne(filter, projection, options) {
      return this.findOne(filter, projection, options)
        .then((request) => (request ? new Request(request) : null));
    }

    static async updateDoc(filter, projection, options) {
      return this.updateOne(filter, projection, options).then((request) => {
        console.log(`updated: ${request}`);
      }).catch((error) => {
        console.log(`error while updating: ${error}`);
      });
    }

    static createRequest(data) {
      const request = new this(data);
      return request;
    }

    getRequestId() {
      // eslint-disable-next-line no-underscore-dangle
      return this._id;
    }

    // TODO: all getters
    getMedicineName() {
      // eslint-disable-next-line no-underscore-dangle
      return this.medicinename;
    }

    getQuantity() {
      return this.quantity;
    }
  }

  return Request;
};

export default RequestFactory;
