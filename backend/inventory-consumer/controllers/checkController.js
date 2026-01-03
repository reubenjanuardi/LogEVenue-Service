const axios = require('axios');
const eventService = require('../services/eventService');

// Service URLs (from env or default)
const VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL || 'http://localhost:4002';
const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || 'http://localhost:4003';

exports.checkEventFeasibility = async (req, res) => {
    try {
        const { eventId } = req.body;
        
        // 1. Get Event Details (Mock Consumer)
        console.log(`Fetching details for Event ${eventId}...`);
        const event = await eventService.getEventDetails(eventId);
        console.log('Event Details:', event);

        // 2. Check Venue Availability
        // Logic: Find a room in the preferred venue (if any) or any venue that matches capacity
        // For simplicity, let's assume we check the preferred venue's rooms matches
        let venueStatus = { available: false, message: 'No suitable venue found' };
        
        // Fetch all venues (or verify specific if known) - simplified logic
        // We will query Venue Service to check for rooms with enough capacity
        // Since Venue Service doesn't have a "search by capacity" endpoint yet, we might list rooms or just assume specific room check if configured
        // Let's assume we check room ID 1 for now or iterate
        
        // Better: We can add an endpoint in Venue Service to "find room by capacity", but I'll list rooms for the preferred venue
        if (event.preferredVenueId) {
            try {
                const roomsRes = await axios.get(`${VENUE_SERVICE_URL}/api/venues/${event.preferredVenueId}/rooms`);
                const rooms = roomsRes.data;
                const suitableRoom = rooms.find(r => r.capacity >= event.requiredCapacity);
                
                if (suitableRoom) {
                    // Check time availability
                    const availRes = await axios.post(`${VENUE_SERVICE_URL}/api/reservations/check-availability`, {
                        roomId: suitableRoom.id,
                        startTime: event.startTime,
                        endTime: event.endTime
                    });
                    
                    if (availRes.data.available) {
                        venueStatus = { available: true, room: suitableRoom, message: 'Venue Available' };
                    } else {
                        venueStatus = { available: false, message: `Room ${suitableRoom.name} is booked.` };
                    }
                } else {
                    venueStatus = { available: false, message: `Venue ${event.preferredVenueId} has no room with capacity ${event.requiredCapacity}` };
                }
            } catch (err) {
                console.error('Venue Service Error:', err.message);
                venueStatus = { available: false, message: 'Venue Service Unavailable' };
            }
        }

        // 3. Check Logistics Status
        // Logic: Check if required facilities (items) are in stock
        // Map "Projector" string to an Item ID (Need a mapping or search)
        // For this demo, let's assume "Projector" matches an item with name containing "Projector"
        let logisticsStatus = { available: true, items: [] };

        try {
            const itemsRes = await axios.get(`${LOGISTICS_SERVICE_URL}/api/items`);
            const allItems = itemsRes.data;

            for (const facility of event.requiredFacilities) {
                const match = allItems.find(i => i.name.toLowerCase().includes(facility.toLowerCase()) || i.category.toLowerCase().includes(facility.toLowerCase()));
                
                if (match) {
                    if (match.availableStock > 0) {
                        logisticsStatus.items.push({ name: facility, status: 'Available', itemId: match.id });
                    } else {
                        logisticsStatus.available = false;
                        logisticsStatus.items.push({ name: facility, status: 'Out of Stock' });
                    }
                } else {
                    // Item not tracked in logistics
                    logisticsStatus.items.push({ name: facility, status: 'Not Tracked/Unknown' });
                }
            }
        } catch (err) {
            console.error('Logistics Service Error:', err.message);
            logisticsStatus = { available: false, message: 'Logistics Service Unavailable' };
        }

        // 4. Return Report
        res.json({
            eventId: event.id,
            feasibility: venueStatus.available && logisticsStatus.available,
            venue: venueStatus,
            logistics: logisticsStatus
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
