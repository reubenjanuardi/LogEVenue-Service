const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const TITIKTEMU_BASE_URL = process.env.TITIKTEMU_BASE_URL || 'http://localhost:3002/api/public';
const TITIKTEMU_API_KEY = process.env.TITIKTEMU_API_KEY || 'your-shared-secret-key';

/**
 * Fetches event details from TitikTemu Public API
 * Based on LOGE_INTEGRATION_GUIDE.md and TITIKTEMU_PUBLIC_API.md
 */
exports.getEventDetails = async (eventId) => {
    try {
        console.log(`Connecting to TitikTemu Event Service for Event ID: ${eventId}...`);

        const response = await axios.get(`${TITIKTEMU_BASE_URL}/events/${eventId}`, {
            headers: {
                'X-LOGE-API-Key': TITIKTEMU_API_KEY
            }
        });

        if (response.data && response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to fetch event from TitikTemu');

    } catch (error) {
        console.error('TitikTemu API Error:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            throw new Error('Event not found in TitikTemu system');
        }

        throw new Error(`TitikTemu Service unavailable: ${error.message}`);
    }
};
