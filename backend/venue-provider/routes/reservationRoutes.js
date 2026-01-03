const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.post('/check-availability', reservationController.checkAvailability);
router.post('/', reservationController.createReservation);
router.get('/', reservationController.getReservations);

module.exports = router;
