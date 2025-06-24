import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Eternal Capsule <no-reply@eternalcapsule.com>',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@eternalcapsule.com',
  domain: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to Eternal Capsule',
    template: (data: { 
      userName: string; 
      planName: string; 
      isTrialing?: boolean; 
      trialEndsAt?: string;
      dashboardUrl: string;
      loginUrl: string;
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">Welcome to Eternal Capsule</h1>
        <p>Dear ${data.userName},</p>
        <p>Welcome to Eternal Capsule! We're excited to help you create meaningful digital memorials that preserve precious memories for generations.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Your Account Details</h3>
          <ul>
            <li><strong>Plan:</strong> ${data.planName}</li>
            ${data.isTrialing ? `<li><strong>Trial Period:</strong> Until ${data.trialEndsAt}</li>` : ''}
            <li><strong>Dashboard:</strong> <a href="${data.dashboardUrl}">Access your dashboard</a></li>
          </ul>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Getting Started</h3>
          <ol>
            <li><a href="${data.dashboardUrl}">Sign in to your dashboard</a></li>
            <li>Create your first memorial with our easy wizard</li>
            <li>Upload photos and share memories</li>
            <li>Invite family and friends to contribute</li>
          </ol>
        </div>
        
        ${data.isTrialing ? `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <p style="margin: 0; color: #2e7d32;"><strong>✨ Free Trial Active</strong></p>
          <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 14px;">
            Enjoy full access to ${data.planName} features until ${data.trialEndsAt}. 
            You can upgrade, downgrade, or cancel anytime from your dashboard.
          </p>
        </div>
        ` : ''}
        
        <p>If you have any questions, our support team is here to help at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a>.</p>
        
        <p>Best regards,<br>The Eternal Capsule Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Get Started Now
          </a>
        </div>
      </div>
    `,
  },

  memorial_created: {
    subject: (data: { deceasedName: string }) => `Memorial Created for ${data.deceasedName}`,
    template: (data: { 
      deceasedName: string; 
      memorialUrl: string; 
      funeralHomeName: string;
      familyEmail: string;
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">Memorial Created</h1>
        <p>Dear Family,</p>
        <p>A beautiful digital memorial has been created for ${data.deceasedName} by ${data.funeralHomeName}.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #8B4513; margin-top: 0;">View Memorial</h3>
          <a href="${data.memorialUrl}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Visit Memorial
          </a>
        </div>
        
        <p><strong>Features available:</strong></p>
        <ul>
          <li>Share memories, photos, and videos</li>
          <li>Leave messages in the guestbook</li>
          <li>View memorial timeline</li>
          <li>Access via NFC tag at graveside</li>
        </ul>
        
        <p>This memorial will serve as a lasting tribute where family and friends can continue to honor and remember ${data.deceasedName}.</p>
        
        <p>With sympathy,<br>${data.funeralHomeName}</p>
      </div>
    `,
  },

  guestbook_entry: {
    subject: (data: { deceasedName: string; authorName: string }) => 
      `New guestbook entry for ${data.deceasedName}`,
    template: (data: {
      deceasedName: string;
      authorName: string;
      message: string;
      memorialUrl: string;
      notifyEmails: string[];
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">New Memorial Message</h1>
        <p>A new message has been left on ${data.deceasedName}'s memorial:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${data.authorName}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #8B4513; padding-left: 16px; margin: 0; color: #555;">
            ${data.message}
          </blockquote>
        </div>
        
        <div style="text-align: center;">
          <a href="${data.memorialUrl}" style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Memorial
          </a>
        </div>
        
        <p>Thank you for keeping ${data.deceasedName}'s memory alive.</p>
      </div>
    `,
  },

  subscription_created: {
    subject: 'Subscription Activated - Welcome to Premium',
    template: (data: { 
      funeralHomeName: string; 
      planName: string; 
      features: readonly string[];
      nextBillingDate: string;
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">Subscription Activated!</h1>
        <p>Dear ${data.funeralHomeName} team,</p>
        <p>Your ${data.planName} subscription has been successfully activated. Thank you for choosing Eternal Capsule!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Your Plan Includes:</h3>
          <ul>
            ${data.features.map(feature => `<li>${feature}</li>`).join('')}
          </ul>
          <p><strong>Next billing date:</strong> ${new Date(data.nextBillingDate).toLocaleDateString()}</p>
        </div>
        
        <p>You can manage your subscription and view invoices in your <a href="${EMAIL_CONFIG.domain}/admin/billing">admin dashboard</a>.</p>
        
        <p>Best regards,<br>The Eternal Capsule Team</p>
      </div>
    `,
  },

  payment_failed: {
    subject: 'Payment Failed - Action Required',
    template: (data: { funeralHomeName: string; planName: string; retryDate: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #d32f2f; text-align: center;">Payment Failed</h1>
        <p>Dear ${data.funeralHomeName} team,</p>
        <p>We were unable to process your payment for the ${data.planName} subscription.</p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Action Required</h3>
          <p>Please update your payment method to continue enjoying uninterrupted service.</p>
          <p><strong>Next retry:</strong> ${new Date(data.retryDate).toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center;">
          <a href="${EMAIL_CONFIG.domain}/admin/billing" style="display: inline-block; background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Update Payment Method
          </a>
        </div>
        
        <p>If you have any questions, please contact our support team at <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a>.</p>
        
        <p>Best regards,<br>The Eternal Capsule Team</p>
      </div>
    `,
  },

  support_ticket: {
    subject: (data: { ticketId: string }) => `Support Ticket #${data.ticketId} - We're Here to Help`,
    template: (data: {
      ticketId: string;
      funeralHomeName: string;
      issue: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">Support Ticket Created</h1>
        <p>Dear ${data.funeralHomeName} team,</p>
        <p>We've received your support request and our team is already working on it.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> #${data.ticketId}</p>
          <p><strong>Priority:</strong> ${data.priority.toUpperCase()}</p>
          <p><strong>Issue:</strong></p>
          <p style="color: #555;">${data.issue}</p>
        </div>
        
        <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 6px;">
          <p style="margin: 0; color: #2e7d32;">
            <strong>Expected Response Time:</strong>
            ${data.priority === 'urgent' ? '1 hour' :
              data.priority === 'high' ? '4 hours' :
              data.priority === 'medium' ? '24 hours' : '48 hours'}
          </p>
        </div>
        
        <p>You'll receive updates via email. For urgent matters, please call our support line.</p>
        
        <p>Best regards,<br>Eternal Capsule Support Team</p>
      </div>
    `,
  },

  contact_notification: {
    subject: 'New Contact Form Submission',
    template: (data: { 
      firstName: string;
      lastName: string;
      email: string;
      organization: string;
      planId: string;
      message: string;
      submissionId: string;
    }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">New Contact Form Submission</h1>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Organization:</strong> ${data.organization}</p>
          <p><strong>Interested Plan:</strong> ${data.planId}</p>
          <p><strong>Submission ID:</strong> ${data.submissionId}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <p>Please respond to this inquiry promptly.</p>
      </div>
    `,
  },

  contact_confirmation: {
    subject: 'Thank you for contacting Eternal Capsule',
    template: (data: { firstName: string; planId: string }) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #8B4513; text-align: center;">Thank You for Contacting Us</h1>
        <p>Dear ${data.firstName},</p>
        <p>Thank you for your interest in Eternal Capsule${data.planId !== 'General Inquiry' ? ` and the ${data.planId} plan` : ''}.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">What happens next?</h3>
          <ul>
            <li>Our team will review your message within 24 hours</li>
            <li>A specialist will contact you to discuss your needs</li>
            <li>We'll provide a personalized demo if requested</li>
            <li>You'll receive detailed pricing and implementation information</li>
          </ul>
        </div>
        
        <p>In the meantime, feel free to explore our <a href="${EMAIL_CONFIG.domain}/pricing">pricing plans</a> or browse our <a href="${EMAIL_CONFIG.domain}/memorial/explore">memorial gallery</a>.</p>
        
        <p>Best regards,<br>The Eternal Capsule Team</p>
      </div>
    `,
  },
} as const;

// Generic email sending function
export async function sendEmail(data: {
  to: string;
  subject: string;
  template: keyof typeof EMAIL_TEMPLATES;
  data: any;
}): Promise<boolean> {
  try {
    // Skip email sending if no API key is configured (e.g., during build)
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'placeholder') {
      console.warn('Resend API key not configured, skipping email send');
      return false;
    }

    const template = EMAIL_TEMPLATES[data.template];
    const subject = typeof template.subject === 'function' ? template.subject(data.data) : template.subject;
    const html = template.template(data.data);

    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send ${data.template} email:`, error);
    return false;
  }
}

// Core email functions
export async function sendWelcomeEmail(data: {
  to: string;
  userName: string;
  planName: string;
  isTrialing?: boolean;
  trialEndsAt?: string;
  dashboardUrl: string;
  loginUrl: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.welcome.subject,
      html: EMAIL_TEMPLATES.welcome.template({
        userName: data.userName,
        planName: data.planName,
        isTrialing: data.isTrialing,
        trialEndsAt: data.trialEndsAt,
        dashboardUrl: data.dashboardUrl,
        loginUrl: data.loginUrl,
      }),
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendMemorialCreatedEmail(data: {
  to: string[];
  deceasedName: string;
  memorialUrl: string;
  funeralHomeName: string;
  familyEmail: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.memorial_created.subject({ deceasedName: data.deceasedName }),
      html: EMAIL_TEMPLATES.memorial_created.template(data),
    });
    return true;
  } catch (error) {
    console.error('Failed to send memorial created email:', error);
    return false;
  }
}

export async function sendGuestbookNotification(data: {
  to: string[];
  deceasedName: string;
  authorName: string;
  message: string;
  memorialUrl: string;
  notifyEmails: string[];
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.guestbook_entry.subject({
        deceasedName: data.deceasedName,
        authorName: data.authorName,
      }),
      html: EMAIL_TEMPLATES.guestbook_entry.template(data),
    });
    return true;
  } catch (error) {
    console.error('Failed to send guestbook notification:', error);
    return false;
  }
}

export async function sendSubscriptionEmail(data: {
  to: string;
  funeralHomeName: string;
  planName: string;
  features: readonly string[];
  nextBillingDate: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.subscription_created.subject,
      html: EMAIL_TEMPLATES.subscription_created.template(data),
    });
    return true;
  } catch (error) {
    console.error('Failed to send subscription email:', error);
    return false;
  }
}

export async function sendPaymentFailedEmail(data: {
  to: string;
  funeralHomeName: string;
  planName: string;
  retryDate: string;
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.payment_failed.subject,
      html: EMAIL_TEMPLATES.payment_failed.template(data),
    });
    return true;
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return false;
  }
}

export async function sendSupportTicketEmail(data: {
  to: string;
  ticketId: string;
  funeralHomeName: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}): Promise<boolean> {
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.to,
      subject: EMAIL_TEMPLATES.support_ticket.subject({ ticketId: data.ticketId }),
      html: EMAIL_TEMPLATES.support_ticket.template(data),
    });
    return true;
  } catch (error) {
    console.error('Failed to send support ticket email:', error);
    return false;
  }
}

// Bulk email for announcements
export async function sendBulkEmail(data: {
  to: string[];
  subject: string;
  html: string;
  batchSize?: number;
}): Promise<{ sent: number; failed: number }> {
  const batchSize = data.batchSize || 50;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < data.to.length; i += batchSize) {
    const batch = data.to.slice(i, i + batchSize);
    
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.from,
        to: batch,
        subject: data.subject,
        html: data.html,
      });
      sent += batch.length;
    } catch (error) {
      console.error(`Failed to send batch ${i / batchSize + 1}:`, error);
      failed += batch.length;
    }

    // Add delay between batches to respect rate limits
    if (i + batchSize < data.to.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { sent, failed };
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Email template customization for funeral homes
export function createCustomTemplate(data: {
  funeralHomeName: string;
  logoUrl?: string;
  primaryColor?: string;
  template: string;
}): string {
  const primaryColor = data.primaryColor || '#8B4513';
  
  let customTemplate = data.template;
  
  // Replace colors
  customTemplate = customTemplate.replace(/#8B4513/g, primaryColor);
  
  // Add logo if provided
  if (data.logoUrl) {
    customTemplate = customTemplate.replace(
      '<h1 style="color: #8B4513; text-align: center;">',
      `<div style="text-align: center; margin-bottom: 20px;">
        <img src="${data.logoUrl}" alt="${data.funeralHomeName}" style="max-height: 60px;">
      </div>
      <h1 style="color: ${primaryColor}; text-align: center;">`
    );
  }
  
  return customTemplate;
}

export { EMAIL_CONFIG, EMAIL_TEMPLATES }; 