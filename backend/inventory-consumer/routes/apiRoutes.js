const express = require('express');
const router = express.Router();
const checkController = require('../controllers/checkController');

router.post('/check-event-feasibility', checkController.checkEventFeasibility);

module.exports = router;
