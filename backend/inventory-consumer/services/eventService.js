// This simulates fetching data from Group A's Event Service
// In a real scenario, this would make an HTTP request to the actual A-Event Service URL

exports.getEventDetails = async (eventId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock Database of Events
    const events = {
        '101': {
            id: '101',
            title: 'Seminar Teknologi',
            startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 90000000).toISOString(),
            requiredCapacity: 50,
            requiredFacilities: ['Projector', 'Sound System'],
            preferredVenueId: 1 // Optional preference
        },
        '102': {
            id: '102',
            title: 'Workshop Coding',
            startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            endTime: new Date(Date.now() + 176400000).toISOString(),
            requiredCapacity: 20,
            requiredFacilities: ['WiFi'],
            preferredVenueId: null
        }
    };

    if (events[eventId]) {
        return events[eventId];
    }
    throw new Error('Event not found');
};
