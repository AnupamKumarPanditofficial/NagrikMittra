// backend/utils/notificationService.js

const nodemailer = require('nodemailer');
const twilio = require('twilio');

// ======== TWILIO (SMS) SETUP ========
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(accountSid, authToken);

// ======== NODEMAILER (EMAIL) SETUP ========
// IMPORTANT: For Gmail, you must create an "App Password" in your Google account settings.
// Do not use your regular password here.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Your Gmail address from .env
        pass: process.env.GMAIL_APP_PASSWORD // Your Gmail App Password from .env
    }
});

/**
 * Sends an OTP via SMS using Twilio
 * @param {string} phoneNumber - The user's phone number
 * @param {string} otp - The 4-digit OTP code
 */
const sendSmsOtp = async (phoneNumber, otp) => {
    try {
        await twilioClient.messages.create({
            body: `Your verification code for Project Civic is: ${otp}`,
            from: twilioPhoneNumber,
            to: phoneNumber
        });
        console.log(`SMS OTP sent successfully to ${phoneNumber}`);
    } catch (error) {
        console.error('Error sending SMS OTP:', error);
    }
};

/**
 * Sends an OTP via Email using Nodemailer
 * @param {string} email - The user's email address
 * @param {string} otp - The 4-digit OTP code
 */
const sendEmailOtp = async (email, otp) => {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your Project Civic Verification Code',
        text: `Your verification code is: ${otp}. It will expire in 10 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email OTP sent successfully to ${email}`);
    } catch (error) {
        console.error('Error sending email OTP:', error);
    }
};

module.exports = {
    sendSmsOtp,
    sendEmailOtp
};