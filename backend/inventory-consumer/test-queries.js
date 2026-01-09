const axios = require('axios');

const GATEWAY_URL = 'http://localhost:4000/graphql';

const queries = [
    {
        name: "1. Dashboard (Venues & Logistics)",
        query: `
            query GetDashboard {
                venues {
                    name
                    address
                    rooms { name capacity }
                }
                items {
                    name
                    availableStock
                    totalStock
                }
            }
        `
    },
    {
        name: "2. Pengecekan Kelayakan Event (ID: 101)",
        query: `
            query Check($eventId: String!) {
                checkFeasibility(eventId: $eventId) {
                    eventId
                    feasibility
                    venue { available message room }
                    logistics {
                        available
                        message
                        items { name status }
                    }
                }
            }
        `,
        variables: { eventId: "101" }
    }
];

async function runTests() {
    console.log('🚀 Menjalankan Uji Coba Query LOGE...\n');

    for (const q of queries) {
        try {
            console.log(`--- Testing: ${q.name} ---`);
            const response = await axios.post(GATEWAY_URL, {
                query: q.query,
                variables: q.variables || {}
            });

            if (response.data.errors) {
                console.error('❌ Error GraphQL:', JSON.stringify(response.data.errors, null, 2));
            } else {
                console.log('✅ Berhasil!');
                console.log('Result:', JSON.stringify(response.data.data, null, 2));
            }
        } catch (error) {
            console.error(`❌ Gagal menghubungi Gateway: ${error.message}`);
            if (error.message.includes('ECONNREFUSED')) {
                console.log('💡 Pastikan API Gateway sudah berjalan (node index.js di folder api-gateway)');
            }
        }
        console.log('\n' + '='.repeat(50) + '\n');
    }
}

runTests();
