const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.post('/', venueController.createVenue);
router.get('/', venueController.getVenues);
router.get('/:id', venueController.getVenueById);
router.put('/:id', venueController.updateVenue);
router.delete('/:id', venueController.deleteVenue);

// Room routes nested or separate? Let's keep them separate but linked maybe?
// Or /venues/:venueId/rooms
router.post('/rooms', venueController.createRoom);
router.get('/:venueId/rooms', venueController.getRoomsByVenue);

module.exports = router;
