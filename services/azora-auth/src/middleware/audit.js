const fs = require('fs').promises;
const path = require('path');

const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || './logs/audit.log';

async function logAudit(event) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...event
  };
  
  try {
    await fs.appendFile(AUDIT_LOG_PATH, JSON.stringify(entry) + '\n');
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

function auditMiddleware(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    logAudit({
      type: 'api_request',
      method: req.method,
      path: req.path,
      userId: req.user?.userId,
      ip: req.ip,
      statusCode: res.statusCode,
      userAgent: req.get('user-agent')
    });
    
    originalSend.call(this, data);
  };
  
  next();
}

async function logAuthAttempt(email, success, ip) {
  await logAudit({
    type: 'auth_attempt',
    email,
    success,
    ip
  });
}

async function logDataAccess(userId, resource, action) {
  await logAudit({
    type: 'data_access',
    userId,
    resource,
    action
  });
}

async function logDataModification(userId, resource, action, changes) {
  await logAudit({
    type: 'data_modification',
    userId,
    resource,
    action,
    changes
  });
}

module.exports = {
  auditMiddleware,
  logAuthAttempt,
  logDataAccess,
  logDataModification
};
