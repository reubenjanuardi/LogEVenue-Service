const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client/core');
const { fetch } = require('cross-fetch');

// Configuration
const GATEWAY_URL = 'http://localhost:4000/graphql';

// 1. Initialize Apollo Client
const client = new ApolloClient({
    link: new HttpLink({ uri: GATEWAY_URL, fetch }),
    cache: new InMemoryCache(),
});

// 2. Define Query
const GET_DASHBOARD = gql`
  query GetDashboard {
    venues {
      name
      address
      rooms {
        name
        capacity
      }
    }
    items {
      name
      availableStock
    }
  }
`;

// 3. Execute Query
async function runExample() {
    console.log('--- LOGE Apollo Client Example ---');
    console.log(`Connecting to: ${GATEWAY_URL}`);

    try {
        const { data } = await client.query({
            query: GET_DASHBOARD,
        });

        console.log('\n✅ Data received from Gateway:');
        console.log('Venues:', JSON.stringify(data.venues, null, 2));
        console.log('Logistics Items:', JSON.stringify(data.items, null, 2));

    } catch (error) {
        console.error('\n❌ Error fetching data:', error.message);
        if (error.networkError) {
            console.error('Network Error details:', error.networkError.result.errors);
        }
    }
}

runExample();
