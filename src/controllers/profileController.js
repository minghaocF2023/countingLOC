/* eslint-disable class-methods-use-this */
import authChecker from '../utils/authChecker.js';
import 'dotenv/config';

class ProfileController {
  constructor(userModel, profileModel) {
    this.userModel = userModel;
    this.profileModel = profileModel;
  }

  /**
   * get profile of current logged in user
   */
  async getProfile(req, res) {
    const username = authChecker.getAuthUsername(req, res);
    const { profileId } = await this.userModel.getUserProfileId(username);
    const profile = await this.profileModel.getOne(profileId);
    res.status(200).json({ profile });
  }

  /**
   * create new user profile
   */
  async postProfile(req, res) {
    const username = authChecker.getAuthUsername(req, res);

    const profileData = req.body.profile;
    if (!profileData) {
      res.status(400).json({ message: 'Bad Request.' });
      return;
    }

    this.profileModel.createNewProfile(req.body.profile).then((profile) => {
      // eslint-disable-next-line no-underscore-dangle
      this.userModel.updateUserProfileId(username, profile._id).then(() => {
        res.status(201).json({ message: 'OK' });
      });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'internal error' });
    });
  }

  /**
 * update user profile
 */
  async updateProfile(req, res) {
    const username = authChecker.getAuthUsername(req, res);
    const { profileId } = await this.userModel.getUserProfileId(username);
    const profileData = req.body.profile;
    const profile = await this.profileModel.updateProfileById(profileId, profileData);
    res.status(201).json({ profile });
  }

  /**
   * delete user profile
   */
  async deleteProfile(req, res) {
    const username = authChecker.getAuthUsername(req, res);
    const { profileId } = await this.userModel.getUserProfileId(username);
    this.profileModel.deleteProfileById(profileId).then(() => {
      res.status(201).json({ message: 'deleted' });
    }).catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'internal error' });
    });
  }
}

export default ProfileController;
