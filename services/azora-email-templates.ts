/**
 * AZORA OS - Email Template Service
 *
 * Professional email templates with Azora branding and personalized user information.
 * Integrates with Elara AI for dynamic content generation.
 */

// Types
interface UserContext {
  name: string;
  email: string;
  role: string;
  company?: string;
  location?: string;
  profileDescription?: string;
}

interface EmailTemplateOptions {
  subject: string;
  body: string;
  userContext: UserContext;
  templateType?: 'professional' | 'educational' | 'creative' | 'minimal';
  callToAction?: string;
  bannerUrl?: string;
}

// Email Template Service
export class AzoraEmailTemplates {
  /**
   * Generate professional email template with Azora branding
   */
  public static generateProfessionalTemplate(options: EmailTemplateOptions): {
    subject: string;
    html: string;
    text: string;
  } {
    const {
      subject,
      body,
      userContext,
      callToAction = 'Learn More',
      bannerUrl,
    } = options;

    // Create personalized description about the user
    const userDescription =
      userContext.profileDescription ||
      this.generateProfileDescription(userContext);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      padding: 40px 20px;
      text-align: center;
      position: relative;
    }
    .logo {
      font-size: 36px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .tagline {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      margin: 8px 0 0 0;
    }
    .banner {
      width: 100%;
      height: 200px;
      background: url('${
        bannerUrl ||
        'https://azora.world/images/branding/email/email-header.svg'
      }') center/cover no-repeat;
      background-color: #0f172a;
    }
    .content {
      padding: 40px 30px;
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(10px);
    }
    .content p {
      margin: 0 0 16px 0;
      color: #e2e8f0;
    }
    .greeting {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 20px;
    }
    .user-description {
      font-style: italic;
      color: #94a3b8;
      margin-bottom: 25px;
      padding: 15px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
    }
    .footer {
      padding: 30px;
      background: rgba(15, 23, 42, 0.9);
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    .footer a {
      color: #8b5cf6;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #94a3b8;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background: rgba(148, 163, 184, 0.2);
      margin: 30px 0;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">AZORA OS</h1>
      <p class="tagline">Where Intelligence Meets Infinity</p>
    </div>

    ${bannerUrl ? '<div class="banner"></div>' : ''}

    <div class="content">
      <h2 class="greeting">Hello ${userContext.name},</h2>

      <div class="user-description">
        You are ${userDescription}, and we're honored to have you as part of the Azora OS community.
      </div>

      ${body}

      ${
        callToAction
          ? `
      <div style="text-align: center;">
        <a href="https://azora.world" class="button">${callToAction}</a>
      </div>
      `
          : ''
      }

      <div class="signature">
        <p>With infinite wisdom,<br/>
        <strong>Elara Deity</strong><br/>
        Omniscient AI of Azora OS</p>
      </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
      <div class="social-links">
        <a href="https://twitter.com/azora_os">Twitter</a>
        <a href="https://github.com/azora-os">GitHub</a>
        <a href="https://linkedin.com/company/azora-os">LinkedIn</a>
      </div>
      <p>
        Azora OS - The Living Operating System<br/>
        © 2025 Azora ES (Pty) Ltd. All Rights Reserved.<br/>
        <a href="https://azora.world">Visit our website</a> |
        <a href="mailto:support@azora.world">Contact Support</a> |
        <a href="https://azora.world/unsubscribe?email=${
          userContext.email
        }">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Generate text version
    const text = `
Hello ${userContext.name},

You are ${userDescription}, and we're honored to have you as part of the Azora OS community.

${body.replace(/<[^>]*>/g, '')}

${
  callToAction
    ? `Call to Action: ${callToAction} - Visit https://azora.world`
    : ''
}

With infinite wisdom,
Elara Deity
Omniscient AI of Azora OS

---

Azora OS - The Living Operating System
© 2025 Azora ES (Pty) Ltd. All Rights Reserved.
Visit our website: https://azora.world
Contact Support: support@azora.world
Unsubscribe: https://azora.world/unsubscribe?email=${userContext.email}
`;

    return {
      subject: `[Azora OS] ${subject}`,
      html,
      text,
    };
  }

  /**
   * Generate educational email template
   */
  public static generateEducationalTemplate(options: EmailTemplateOptions): {
    subject: string;
    html: string;
    text: string;
  } {
    const {
      subject,
      body,
      userContext,
      callToAction = 'Start Learning',
      bannerUrl,
    } = options;

    const userDescription =
      userContext.profileDescription ||
      this.generateProfileDescription(userContext);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.7;
      color: #334155;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: 700;
      margin: 0;
    }
    .tagline {
      font-size: 16px;
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .banner {
      width: 100%;
      height: 180px;
      background: url('${
        bannerUrl ||
        'https://azora.world/images/branding/email/email-header.svg'
      }') center/cover no-repeat;
      background-color: #0ea5e9;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #0369a1;
      margin-top: 0;
    }
    .content p {
      margin: 0 0 20px 0;
      color: #334155;
    }
    .greeting {
      font-size: 22px;
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 20px;
    }
    .user-description {
      font-style: italic;
      color: #64748b;
      margin-bottom: 25px;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 8px;
      border-left: 4px solid #0ea5e9;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 25px 0;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.4);
    }
    .footer {
      padding: 30px;
      background: #f8fafc;
      text-align: center;
      color: #64748b;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #0ea5e9;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">AZORA SAPIENS</h1>
      <p class="tagline">Advanced Learning for the Digital Age</p>
    </div>

    ${bannerUrl ? '<div class="banner"></div>' : ''}

    <div class="content">
      <h2 class="greeting">Dear ${userContext.name},</h2>

      <div class="user-description">
        As ${userDescription}, you have access to our cutting-edge educational platform designed to accelerate your learning journey.
      </div>

      ${body}

      ${
        callToAction
          ? `
      <div style="text-align: center;">
        <a href="https://learn.azora.world" class="button">${callToAction}</a>
      </div>
      `
          : ''
      }

      <div class="signature">
        <p>Wisdom and guidance,<br/>
        <strong>Elara Deity</strong><br/>
        Your AI Learning Companion</p>
      </div>
    </div>

    <div class="footer">
      <p>
        Azora Sapiens - Advanced Learning Platform<br/>
        © 2025 Azora ES (Pty) Ltd. All Rights Reserved.<br/>
        <a href="https://learn.azora.world">Visit Learning Platform</a> |
        <a href="mailto:education@azora.world">Contact Education Team</a> |
        <a href="https://azora.world/unsubscribe?email=${
          userContext.email
        }">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Generate text version
    const text = `
Dear ${userContext.name},

As ${userDescription}, you have access to our cutting-edge educational platform designed to accelerate your learning journey.

${body.replace(/<[^>]*>/g, '')}

${
  callToAction
    ? `Call to Action: ${callToAction} - Visit https://learn.azora.world`
    : ''
}

Wisdom and guidance,
Elara Deity
Your AI Learning Companion

---

Azora Sapiens - Advanced Learning Platform
© 2025 Azora ES (Pty) Ltd. All Rights Reserved.
Visit Learning Platform: https://learn.azora.world
Contact Education Team: education@azora.world
Unsubscribe: https://azora.world/unsubscribe?email=${userContext.email}
`;

    return {
      subject: `[Azora Sapiens] ${subject}`,
      html,
      text,
    };
  }

  /**
   * Generate minimal email template
   */
  public static generateMinimalTemplate(options: EmailTemplateOptions): {
    subject: string;
    html: string;
    text: string;
  } {
    const { subject, body, userContext, callToAction } = options;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px 30px;
      border: 1px solid #e5e7eb;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #4f46e5;
      margin: 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 15px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">AZORA OS</h1>
    </div>

    <div class="content">
      <p>Hi ${userContext.name},</p>
      ${body}
      ${
        callToAction
          ? `<p><a href="https://azora.world" class="button">${callToAction}</a></p>`
          : ''
      }
      <p>Best regards,<br/>The Azora OS Team</p>
    </div>

    <div class="footer">
      <p>
        © 2025 Azora ES (Pty) Ltd. All Rights Reserved.<br/>
        <a href="https://azora.world/unsubscribe?email=${
          userContext.email
        }">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    // Generate text version
    const text = `
Hi ${userContext.name},

${body.replace(/<[^>]*>/g, '')}

${
  callToAction
    ? `Call to Action: ${callToAction} - Visit https://azora.world`
    : ''
}

Best regards,
The Azora OS Team

---

© 2025 Azora ES (Pty) Ltd. All Rights Reserved.
Unsubscribe: https://azora.world/unsubscribe?email=${userContext.email}
`;

    return {
      subject: `[Azora OS] ${subject}`,
      html,
      text,
    };
  }

  /**
   * Generate profile description based on user context
   */
  private static generateProfileDescription(user: UserContext): string {
    let description = 'a valued member of our community';

    if (user.role === 'student') {
      description = 'an ambitious student pursuing knowledge and growth';
    } else if (user.role === 'developer') {
      description = 'a talented developer building the future';
    } else if (user.role === 'entrepreneur') {
      description = 'an innovative entrepreneur driving change';
    } else if (user.role === 'educator') {
      description = 'a dedicated educator shaping minds';
    } else if (user.company) {
      description = `a professional at ${user.company}`;
    }

    if (user.location) {
      description += ` from ${user.location}`;
    }

    return description;
  }

  /**
   * Generate email template based on type
   */
  public static generateTemplate(options: EmailTemplateOptions): {
    subject: string;
    html: string;
    text: string;
  } {
    const { templateType = 'professional' } = options;

    switch (templateType) {
      case 'educational':
        return this.generateEducationalTemplate(options);
      case 'minimal':
        return this.generateMinimalTemplate(options);
      case 'creative':
        // For creative, we'll use professional template with different styling
        return this.generateProfessionalTemplate(options);
      case 'professional':
      default:
        return this.generateProfessionalTemplate(options);
    }
  }
}

// Export types
export type { EmailTemplateOptions, UserContext };
