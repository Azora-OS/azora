module.exports = {
  subject: 'Welcome to Azora OS',
  html: (data) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3B82F6;">Welcome to Azora OS, ${data.name}!</h1>
      <p>Ubuntu: I am because we are.</p>
      <p>Your account has been created successfully. Start your learning journey today.</p>
      <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
    </div>
  `,
  text: (data) => `Welcome to Azora OS, ${data.name}! Your account is ready. Visit: ${data.dashboardUrl}`
};
