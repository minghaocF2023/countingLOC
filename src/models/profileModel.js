/* eslint-disable class-methods-use-this */
import mongoose from 'mongoose';

const ProfileFactory = (connection) => {
  const ProfileSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    pronoun: {
      type: String,
      required: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    doctorID: {
      type: mongoose.Types.ObjectId,
    },
    doctorEmail: {
      type: String,
      required: true,
    },
    drugAllergy: {
      type: Array,
      required: true,
    },
    healthCondition: {
      type: Array,
      required: true,
    },
  });

  let ProfileModel;
  if (connection.models.Profile) {
    ProfileModel = connection.models.Profile;
  } else {
    ProfileModel = connection.model('Profile', ProfileSchema);
  }

  class Profile extends ProfileModel {
    /**
     * Get all private messages
     * @param {mongoose.FilterQuery<Profile>} filter
     * @param {mongoose.ProjectionType<Profile>?=} projection
     * @param {mongoose.QueryOptions<Profile>?=} options
     * @returns {Promise<Profile[]>} array of private messages
     */
    async get(filter, projection, options) {
      return Profile.find(filter, projection, options)
        .then((privateMessages) => privateMessages.map((pm) => new Profile(pm)));
    }

    async getOne(filter, projection, options) {
      return Profile.findOne(filter, projection, options)
        .then((pm) => (pm ? new Profile(pm) : null));
    }

    async createNewProfile(data) {
      const newProfile = new Profile(data);
      await newProfile.save();
      return newProfile;
    }

    async deleteProfileById(id) {
      Profile.findOneAndDelete({ _id: id }).catch((error) => {
        console.error(error);
      });
    }

    async deleteAll() {
      await Profile.deleteMany({});
    }

    async updateProfileById(id, data) {
      const newProfile = await Profile.findOneAndUpdate({ _id: id }, data, {
        new: true,
      });
      return newProfile;
    }
  }
  return Profile;
};

export default ProfileFactory;
