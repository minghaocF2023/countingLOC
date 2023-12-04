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
const MedicineFactory = (connection) => {
  // console.log(connection);
  const MedicineSchema = new mongoose.Schema({
    medicinename: {
      type: String,
      unique: true,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  });

  let MedicineModel;
  if (connection.models.Medicine) {
    MedicineModel = connection.models.Medicine;
  } else {
    MedicineModel = connection.model('Medicine', MedicineSchema);
  }

  class Medicine extends MedicineModel {
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
        .then((medicines) => medicines.map((medicine) => new Medicine(medicine)));
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
        .then((medicine) => (medicine ? new Medicine(medicine) : null));
    }

    static async updateDoc(filter, projection, options) {
      return this.updateOne(filter, projection, options).then((medicine) => {
        console.log(`updated: ${medicine}`);
      }).catch((error) => {
        console.log(`error while updating: ${error}`);
      });
    }

    static createMedicine(data) {
      const medicine = new this(data);
      return medicine;
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

  return Medicine;
};

export default MedicineFactory;
