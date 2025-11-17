const app = require('./index.js');

const PORT = process.env.PORT || 3013;

app.listen(PORT, () => {
  console.log(`Research Center Service running on port ${PORT}`);
});