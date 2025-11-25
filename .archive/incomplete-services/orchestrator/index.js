const app = require('./server');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✨ ${serviceName} running on port ${PORT}`);
  console.log('🌍 Ubuntu: "I serve because we prosper together"');
});