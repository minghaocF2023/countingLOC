import nodeMailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import 'dotenv/config';
import ejs from 'ejs';

const mailAlertController = {
  sendMailAlert: (req, res) => {
    const transporter = nodeMailer.createTransport(smtpTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      secureConnection: false, // TLS encryption
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }));

    const template = `${req.app.get('views')}/templates/mail.ejs`;
    ejs.renderFile(template, { receiver: 'Dr. Leo' }, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const mailOptions = {
        from: '"ESN Community" <esn.alert@gmail.com>',
        to: req.body.email,
        cc: 'esn.alert@gmail.com',
        subject: '[TEST] This is a testing email for ESN',
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
  },
};

export default mailAlertController;
