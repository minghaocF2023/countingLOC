import nodeMailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import 'dotenv/config';

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

export default transporter;
