/* eslint-disable class-methods-use-this */
import ejs from 'ejs';
import transporter from '../utils/mailer.js';
import authChecker from '../utils/authChecker.js';

class MailAlertController {
  constructor(userModel, profileModel) {
    this.userModel = userModel;
    this.profileModel = profileModel;
  }

  async sendMailAlert(req, res) {
    const username = authChecker.getAuthUsername(req, res);
    const { profileId } = await this.userModel.getUserProfileId(username);

    if (!profileId) {
      res.status(404).json({ message: 'profile not found' });
      return;
    }
    const profile = await this.profileModel.getOne(profileId);

    const template = `${req.app.get('views')}/templates/mail.ejs`;
    ejs.renderFile(template, { receiver: `${profile.firstName}'s Emergency Contact`, profile }, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const mailOptions = {
        from: '"ESN Community" <esn.alert@gmail.com>',
        to: profile.doctorEmail,
        cc: 'esn.alert@gmail.com',
        subject: '[Emergency] Emergency Alert from ESN',
        html: data,
        attachments: [
          {
            filename: 'logo.png',
            path: `${req.app.get('public')}/images/splash-screen.png`,
            cid: 'logo1',
          },
          {
            filename: 'logo2.png',
            path: `${req.app.get('public')}/images/ambulance.png`,
            cid: 'logo2',
          },
        ],
      };
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(err);
          res.status(500).json({ message: 'sending message error' });
          return;
        }

        res.status(200).json({ message: 'OK' });
      });
    });
  }
}

export default MailAlertController;
