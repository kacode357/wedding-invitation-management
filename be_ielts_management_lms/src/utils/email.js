// Email utility for sending notifications
const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 */
async function sendEmail(to, subject, html, text = "") {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("Email credentials not configured, skipping email send");
      return { skipped: true };
    }

    const info = await transporter.sendMail({
      from: `"Wedding Invitation Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✓ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("✗ Error sending email:", error);
    throw error;
  }
}

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(email, name, role) {
  const subject = "Welcome to Wedding Invitation Management";
  const html = `
    <h2>Welcome ${name}!</h2>
    <p>Your ${role} account has been created successfully.</p>
    <p>You can now log in to the system and start using Wedding Invitation Management.</p>
    <br>
    <p>Best regards,<br>Wedding Invitation Management Team</p>
  `;
  
  return sendEmail(email, subject, html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const subject = "Password Reset Request";
  const html = `
    <h2>Password Reset</h2>
    <p>You requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br>Wedding Invitation Management Team</p>
  `;
  
  return sendEmail(email, subject, html);
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
