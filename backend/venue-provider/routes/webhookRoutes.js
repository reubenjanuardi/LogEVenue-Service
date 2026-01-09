const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook endpoint for TitikTemu (LOGE_INTEGRATION_GUIDE Use Case 2/3)
router.post('/event-created', webhookController.handleEventCreated);

module.exports = router;
