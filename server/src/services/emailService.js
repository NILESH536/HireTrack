const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.configured = !!(process.env.MAIL_USER && process.env.MAIL_PASS);
    
    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
    }
  }

  async sendMail(to, subject, html) {
    if (!this.configured) {
      logger.info(`[Email Skipped] To: ${to} | Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || '"HireTrack" <noreply@hirectrack.com>',
        to,
        subject,
        html,
      });
      logger.info(`[Email Sent] To: ${to} | Subject: ${subject}`);
    } catch (error) {
      logger.error(`[Email Error] To: ${to}:`, error.message);
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; background: #0e1525; color: #e5e7eb; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3b82f6; font-size: 28px;">Welcome to HireTrack! 🚀</h1>
        <p>Hi ${user.name},</p>
        <p>Your account has been created successfully. ${
          user.role === 'COMPANY' 
            ? 'Your account is pending admin approval. We\'ll notify you once approved.'
            : 'You can now start exploring placement drives and applying to companies.'
        }</p>
        <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #3b82f6, #06b6d4); color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Login to Dashboard
        </a>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
          — The HireTrack Team
        </p>
      </div>
    `;
    await this.sendMail(user.email, 'Welcome to HireTrack!', html);
  }

  async sendPlacementCongrats(user, companyName, jobRole) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; background: #0e1525; color: #e5e7eb; padding: 40px; border-radius: 16px;">
        <h1 style="color: #22c55e; font-size: 28px;">🎉 Congratulations!</h1>
        <p>Hi ${user.name},</p>
        <p>You have been <strong style="color: #22c55e;">SELECTED</strong> by <strong>${companyName}</strong> for the role of <strong>${jobRole}</strong>!</p>
        <p>Your hard work has paid off. All the best for your career ahead!</p>
        <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
          — The HireTrack Team
        </p>
      </div>
    `;
    await this.sendMail(user.email, `Congratulations! You've been selected by ${companyName}`, html);
  }

  async sendCompanyApproved(user) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; background: #0e1525; color: #e5e7eb; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3b82f6; font-size: 28px;">Account Approved ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Your company account has been approved. You can now log in and post placement drives.</p>
        <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #3b82f6, #06b6d4); color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Go to Dashboard
        </a>
      </div>
    `;
    await this.sendMail(user.email, 'HireTrack: Your Account Has Been Approved', html);
  }

  async sendCompanyRejected(user, reason) {
    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; background: #0e1525; color: #e5e7eb; padding: 40px; border-radius: 16px;">
        <h1 style="color: #ef4444; font-size: 28px;">Registration Not Approved</h1>
        <p>Hi ${user.name},</p>
        <p>Unfortunately, your company registration was not approved.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this is an error, please contact the placement cell.</p>
      </div>
    `;
    await this.sendMail(user.email, 'HireTrack: Registration Update', html);
  }
}

module.exports = new EmailService();
