const app = require('./dist/index.js');

const PORT = process.env.PORT || 3011;

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});