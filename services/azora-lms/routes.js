const express = require('express');
const router = express.Router();
const lmsRouter = require('./api/lms');
const contentRouter = require('./api/content');
const assessmentRouter = require('./api/assessments');

router.use('/api', lmsRouter);
router.use('/api/content', contentRouter);
router.use('/api/assessments', assessmentRouter);

module.exports = router;
