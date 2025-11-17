const app = require('./index.js');

const PORT = process.env.PORT || 3018;

app.listen(PORT, () => {
  console.log(`Quantum Deep Mind Service running on port ${PORT}`);
});