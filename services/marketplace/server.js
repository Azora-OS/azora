const app = require('./dist/index.js');

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`Marketplace Service running on port ${PORT}`);
});