import crypto from 'crypto';

class AdminController {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async getUserProfile(req, res) {
    const { username } = req.params;
    const userProfile = await this.userModel.findOne({ username }).select('-_id username isActive privilege');
    if (!userProfile) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ message: 'Success', userProfile });
  }

  async updateUserProfile(req, res) {
    const { username } = req.params;
    const updateData = req.body;

    if (updateData.password) {
      // password encrypt
      const salt = crypto.randomBytes(16);
      const hashedPassword = await this.userModel.hashPassword(updateData.password, salt);
      updateData.password = hashedPassword;
      updateData.salt = salt.toString('base64');
    }

    const oldUser = await this.userModel.findOneAndUpdate({ username }, updateData);
    if (!oldUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userProfile = await this.userModel.findOne({ username: updateData.username }).select('-_id username isActive privilege');
    res.status(200).json({ message: 'User profile successfully updated', userProfile });

    // TODO: handle INACTIVE
  }
}

export default AdminController;
