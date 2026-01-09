const Reservation = require('../models/Reservation');
const Room = require('../models/Room');

exports.handleEventCreated = async (req, res) => {
    try {
        const apiKey = req.headers['x-loge-api-key'];
        const EXPECTED_API_KEY = process.env.TITIKTEMU_API_KEY || 'your-shared-secret-key';

        if (apiKey !== EXPECTED_API_KEY) {
            return res.status(401).json({ success: false, message: 'Invalid API key' });
        }

        const { eventId, title, venueId, roomId, startDate, capacity } = req.body;

        console.log(`📩 Received event-created webhook from TitikTemu for Event: ${title} (${eventId})`);

        if (!venueId) {
            return res.json({ success: true, message: 'Event notification received (no venue assigned)' });
        }

        // Search for the room if roomId is not provided but venueId is
        let targetRoomId = roomId;
        if (!targetRoomId) {
            const room = await Room.findOne({ where: { venueId: venueId } });
            if (room) targetRoomId = room.id;
        }

        if (!targetRoomId) {
            return res.status(400).json({ success: false, message: 'No suitable room found for venueId: ' + venueId });
        }

        // Create a reservation automatically
        const startTime = startDate || new Date().toISOString();
        const endTime = new Date(new Date(startTime).getTime() + 3600000).toISOString(); // Default 1 hour

        const reservation = await Reservation.create({
            roomId: targetRoomId,
            userId: 'TITIKTEMU_SYSTEM',
            startTime,
            endTime,
            status: 'confirmed',
            notes: `Auto-booked via TitikTemu Event: ${title}`
        });

        res.status(200).json({
            success: true,
            message: 'Event notification received and reservation created',
            data: {
                eventId,
                reservationId: reservation.id,
                processedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
