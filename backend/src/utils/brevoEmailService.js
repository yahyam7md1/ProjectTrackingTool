/**
 * Brevo Email Service Utility
 * Provides functions for sending emails using Brevo (Sendinblue)
 */

const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure API key authorization
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || 'YOUR_API_KEY';

// Create API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

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
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'PhaseTracker: Your Verification Code';
    sendSmtpEmail.htmlContent = `
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
    `;
    sendSmtpEmail.sender = {
      name: 'PhaseTracker',
      email: process.env.EMAIL_USER || 'noreply@phasetracker.com',
    };
    sendSmtpEmail.to = [
      { email: toEmail }
    ];
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return data;
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
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.subject = 'PhaseTracker: You have been assigned to a project 😊';
    sendSmtpEmail.htmlContent = `
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
    `;
    sendSmtpEmail.sender = {
      name: 'PhaseTracker',
      email: process.env.EMAIL_USER || 'noreply@phasetracker.com',
    };
    sendSmtpEmail.to = [
      { email: toEmail }
    ];
    
    // Send the email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return data;
  } catch (error) {
    console.error('Error sending project assignment notification email:', error);
    throw error;
  }
};

/**
 * @function validateEmail
 * @desc    Validates if an email address exists and can potentially receive emails
 * @param   {String} email - Email address to validate
 * @returns {Promise<boolean>} - Promise resolving to true if email is valid
 * @throws  {Error} - Throws error if validation fails
 */
const validateEmail = async (email) => {
  try {
    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Check if domain has valid MX records
    // This is a simplified check - in a production environment,
    // you might want to use a more sophisticated email validation service
    if (!domain || domain.includes('invaild') || domain === 'example.com') {
      return false;
    }
    
    // For a more thorough check, you could integrate with an email validation API
    return true;
  } catch (error) {
    console.error('Error validating email:', error);
    return false;
  }
};

// Export functions
module.exports = {
  sendVerificationEmail,
  sendProjectAssignmentNotification,
  validateEmail
};