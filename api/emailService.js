const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASS_SENDER,
  },
});

function sendPasswordResetEmail(to, token) {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: to,
    subject: 'Password Reset',
    text: `You requested a password reset. Use the following token to reset your password: ${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email: ', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendPasswordResetEmail,
};
