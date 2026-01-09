const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { Op } = require('sequelize');
const axios = require('axios');

exports.checkAvailability = async (req, res) => {
    try {
        const { roomId, startTime, endTime } = req.body;

        // Find existing confirmed reservations overlapping with the requested time
        const existingReservation = await Reservation.findOne({
            where: {
                roomId,
                status: 'confirmed',
                [Op.or]: [
                    {
                        startTime: {
                            [Op.between]: [startTime, endTime]
                        }
                    },
                    {
                        endTime: {
                            [Op.between]: [startTime, endTime]
                        }
                    },
                    {
                        startTime: {
                            [Op.lte]: startTime
                        },
                        endTime: {
                            [Op.gte]: endTime
                        }
                    }
                ]
            }
        });

        if (existingReservation) {
            return res.json({ available: false, message: 'Room is already booked for this time slot.' });
        }
        res.json({ available: true, message: 'Room is available.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createReservation = async (req, res) => {
    try {
        const { roomId, userId, startTime, endTime } = req.body;

        // Ensure no overlap before creating (simple check, could reuse checkAvailability logic)
        const conflict = await Reservation.findOne({
            where: {
                roomId,
                status: 'confirmed',
                [Op.or]: [
                    { startTime: { [Op.between]: [startTime, endTime] } },
                    { endTime: { [Op.between]: [startTime, endTime] } },
                    { startTime: { [Op.lte]: startTime }, endTime: { [Op.gte]: endTime } }
                ]
            }
        });

        if (conflict) {
            return res.status(400).json({ message: 'Time slot conflict.' });
        }

        const reservation = await Reservation.create({
            roomId,
            userId,
            startTime,
            endTime,
            status: 'confirmed' // Auto-confirm for now, or use pending
        });

        // Notify TitikTemu via Webhook (LOGE_INTEGRATION_GUIDE Use Case 2)
        const TITIKTEMU_BASE_URL = process.env.TITIKTEMU_BASE_URL || 'http://localhost:3002/api/public';
        const TITIKTEMU_API_KEY = process.env.TITIKTEMU_API_KEY || 'your-shared-secret-key';

        try {
            const room = await Room.findByPk(roomId);
            await axios.post(`${TITIKTEMU_BASE_URL}/webhook/venue-status`, {
                venueId: room.venueId,
                available: false,
                reason: `Event booked for ${startTime} to ${endTime}`,
                timestamp: new Date().toISOString()
            }, {
                headers: { 'X-LOGE-API-Key': TITIKTEMU_API_KEY }
            });
            console.log(`✅ Notified TitikTemu about venue ${room.venueId} status change`);
        } catch (webhookErr) {
            console.error('⚠️ Failed to notify TitikTemu webhook:', webhookErr.message);
            // Don't fail the reservation if webhook fails
        }

        res.status(201).json(reservation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.findAll({ include: Room });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
