const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const { Op } = require('sequelize');

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
