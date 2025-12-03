const app = require('./index.js');

// Export the Express app for testing purposes
module.exports = app;

// Optional: Log startup message when run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3010;
    app.listen(PORT, () => {
        console.log(`AI Ethics Monitor Service running on port ${PORT}`);
    });
}