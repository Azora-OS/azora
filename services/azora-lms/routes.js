
const express = require('express');
const router = express.Router();
const lmsRouter = require('./api/lms');

router.use('/api', lmsRouter);

module.exports = router;
