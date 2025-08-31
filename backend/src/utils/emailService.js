/**
 * Email Service Utility
 * Provides functions for sending emails using Nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Create a Nodemailer transport
 * This uses Gmail SMTP for sending emails
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Default is a placeholder
    pass: process.env.EMAIL_PASSWORD || 'your-app-password', // Default is a placeholder
  },
});

/**
 * @function sendVerificationEmail
 * @desc    Sends verification email with the provided code
 * @param   {String} toEmail - Recipient email address
 * @param   {String} code - Verification code to include in email
 * @returns {Promise<Object>} - Promise resolving to email send info
 * @throws  {Error} - Throws error if email sending fails
 */
const sendVerificationEmail = async (toEmail, code) => {
  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: toEmail,
      subject: 'PhaseTracker: Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">PhaseTracker Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code for PhaseTracker is:</p>
          <div style="background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <h2 style="color: #4a6ee0; letter-spacing: 2px;">${code}</h2>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Thank you,<br>The PhaseTracker Team</p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * @function sendProjectAssignmentNotification
 * @desc    Sends an email notification when a client is assigned to a project
 * @param   {String} toEmail - Recipient email address
 * @param   {String} projectName - Name of the project the client is assigned to
 * @returns {Promise<Object>} - Promise resolving to email send info
 * @throws  {Error} - Throws error if email sending fails
 */

const sendProjectAssignmentNotification = async (toEmail, projectName) => {
try{

  //Emaill content
  const mailOptions = {
    from : process.env.EMAIL_USER || 'your-email@gmail.com',
    to: toEmail,
    subject: 'PhaseTracker: You have been assigned to a project 😊',
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Project Assignment Notification</h2>
          <p>Hello,</p>
          <p>You have been assigned to the following project in PhaseTracker:</p>
          <div style="background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
            <h3 style="color: #4a6ee0;">${projectName}</h3>
          </div>
          <p>You can now log in to your client dashboard to track the project's progress.</p>
          <p>Thank you,<br>The PhaseTracker Team</p>
        </div>
              `,

  };

  const info = await transporter.sendMail(mailOptions);
  return info;
} catch (error){

    console.error('Error sending project assignment notification email:', error);
    throw error;
  }
};


module.exports = {
  sendVerificationEmail,
  sendProjectAssignmentNotification
};
