const fs = require('fs');
const path = require('path');

function logEvent(event, data) {
  const logPath = path.join(__dirname, '../../../logs/azora.log');
  const entry = `[${new Date().toISOString()}] [${event}] ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logPath, entry);
}

module.exports = { logEvent };