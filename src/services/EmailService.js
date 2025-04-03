import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendResetPasswordEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Reset Your Password',
    text: `To reset your password, click the following link: ${resetLink}`,
    html: `<p>To reset your password, click the following <a href="${resetLink}">link</a>.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
