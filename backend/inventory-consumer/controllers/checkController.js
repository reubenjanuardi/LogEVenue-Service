const axios = require('axios');
const eventService = require('../services/eventService');
const FeasibilityLog = require('../models/FeasibilityLog');

// Service URLs (from env or default)
const VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL || 'http://localhost:4002';
const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || 'http://localhost:4003';

// Core Logic extracted for both REST and GraphQL
exports.internalCheckFeasibility = async (eventId) => {
    // 1. Get Event Details from TitikTemu
    const event = await eventService.getEventDetails(eventId);

    // 2. Check Venue Availability
    // TitikTemu uses 'capacity' field
    const requiredCapacity = event.capacity || 0;
    const requiredFacilities = event.requiredFacilities || []; // Default to empty if not provided by TitikTemu

    let venueStatus = { available: false, message: 'No suitable venue found', room: null };

    if (event.venueId) {
        try {
            // Check specific room if provided by TitikTemu, otherwise search in venue
            const roomsRes = await axios.get(`${VENUE_SERVICE_URL}/api/venues/${event.venueId}/rooms`);
            const rooms = roomsRes.data;

            let suitableRoom;
            if (event.roomId) {
                suitableRoom = rooms.find(r => r.id == event.roomId);
            } else {
                suitableRoom = rooms.find(r => r.capacity >= requiredCapacity);
            }

            if (suitableRoom) {
                // Check if the capacity matches (secondary check)
                if (suitableRoom.capacity < requiredCapacity) {
                    venueStatus = { available: false, message: `Room ${suitableRoom.name} capacity (${suitableRoom.capacity}) is less than required (${requiredCapacity})` };
                } else {
                    const availRes = await axios.post(`${VENUE_SERVICE_URL}/api/reservations/check-availability`, {
                        roomId: suitableRoom.id,
                        startTime: event.startDate || new Date().toISOString(), // Use TitikTemu field
                        endTime: event.endDate || new Date(Date.now() + 3600000).toISOString() // Default to 1 hour if missing
                    });

                    if (availRes.data.available) {
                        venueStatus = { available: true, room: suitableRoom.name, message: 'Venue Available' };
                    } else {
                        venueStatus = { available: false, message: `Room ${suitableRoom.name} is already booked for this time.` };
                    }
                }
            } else {
                venueStatus = { available: false, message: `Venue ${event.venueId} has no suitable room.` };
            }
        } catch (err) {
            console.error('Venue Service Error:', err.message);
            venueStatus = { available: false, message: 'Venue Service Unavailable' };
        }
    }

    // 3. Check Logistics Status
    let logisticsStatus = { available: true, items: [], message: 'Logistics Checked' };

    if (requiredFacilities.length > 0) {
        try {
            const itemsRes = await axios.get(`${LOGISTICS_SERVICE_URL}/api/items`);
            const allItems = itemsRes.data;

            for (const facility of requiredFacilities) {
                const match = allItems.find(i => i.name.toLowerCase().includes(facility.toLowerCase()) || i.category.toLowerCase().includes(facility.toLowerCase()));

                if (match) {
                    if (match.availableStock > 0) {
                        logisticsStatus.items.push({ name: facility, status: 'Available', itemId: match.id });
                    } else {
                        logisticsStatus.available = false;
                        logisticsStatus.items.push({ name: facility, status: 'Out of Stock' });
                    }
                } else {
                    logisticsStatus.items.push({ name: facility, status: 'Not Tracked/Unknown' });
                }
            }
        } catch (err) {
            console.error('Logistics Service Error:', err.message);
            logisticsStatus = { available: false, message: 'Logistics Service Unavailable' };
        }
    } else {
        logisticsStatus.message = 'No facilities required for this event.';
    }

    const feasibility = venueStatus.available && logisticsStatus.available;

    // 4. Save to Database
    try {
        await FeasibilityLog.create({
            eventId: event.id,
            eventTitle: event.title,
            isFeasible: feasibility,
            venueStatus: venueStatus,
            logisticsStatus: logisticsStatus
        });
        console.log(`✅ Feasibility log saved for Event ${eventId}`);
    } catch (dbErr) {
        console.error('Error saving feasibility log:', dbErr.message);
    }

    return {
        eventId: event.id,
        feasibility: feasibility,
        venue: venueStatus,
        logistics: logisticsStatus
    };
};

exports.checkEventFeasibility = async (req, res) => {
    try {
        const { eventId } = req.body;
        if (!eventId) {
            return res.status(400).json({ error: 'eventId is required' });
        }

        const result = await exports.internalCheckFeasibility(eventId);
        res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
