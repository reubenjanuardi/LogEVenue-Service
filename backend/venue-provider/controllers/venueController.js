const Venue = require('../models/Venue');
const Room = require('../models/Room');

exports.createVenue = async (req, res) => {
    try {
        const venue = await Venue.create(req.body);
        res.status(201).json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.findAll();
        res.json(venues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVenueById = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id, {
            include: [{ model: Room }]
        });
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        res.json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        await venue.update(req.body);
        res.json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVenue = async (req, res) => {
    try {
        const venue = await Venue.findByPk(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        await venue.destroy();
        res.json({ message: 'Venue deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Rooms
exports.createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRoomsByVenue = async (req, res) => {
    try {
        const rooms = await Room.findAll({ where: { venueId: req.params.venueId } });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
