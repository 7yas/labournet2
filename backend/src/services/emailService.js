const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (email, fullName, role) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email credentials not configured');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Field Fix It Now!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #004A57;">Welcome to LabourNet!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for joining LabourNet as a ${role}. We're excited to have you on board!</p>
          <p>With your new account, you can:</p>
          <ul>
            <li>Access your personalized dashboard</li>
            <li>Connect with other professionals</li>
            <li>Manage your projects and applications</li>
          </ul>
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          <p>Best regards,<br>The Labournet Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail
}; 