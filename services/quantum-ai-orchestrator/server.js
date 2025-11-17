const app = require('./index.js');

const PORT = process.env.PORT || 3017;

app.listen(PORT, () => {
  console.log(`Quantum AI Orchestration Service running on port ${PORT}`);
});