const { ApolloServer, AuthenticationError } = require('apollo-server');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { print, Kind } = require('graphql');
const { fetch } = require('cross-fetch');
const { schemaFromExecutor, wrapSchema } = require('@graphql-tools/wrap');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client/core');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const VENUE_SERVICE_URL = process.env.VENUE_SERVICE_URL || 'http://localhost:4002/graphql';
const LOGISTICS_SERVICE_URL = process.env.LOGISTICS_SERVICE_URL || 'http://localhost:4003/graphql';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4004/graphql';
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_negara_grup_b';

async function createRemoteSchema(url) {
    const client = new ApolloClient({
        link: new HttpLink({ uri: url, fetch }),
        cache: new InMemoryCache(),
    });

    const executor = async ({ document, variables, context }) => {
        const query = print(document);
        // Forward the authorization header if it exists
        const headers = {};
        if (context && context.token) {
            headers['Authorization'] = `Bearer ${context.token}`;
        }

        const operationDefinition = document.definitions.find(
            def => def.kind === Kind.OPERATION_DEFINITION
        );
        const isMutation = operationDefinition && operationDefinition.operation === 'mutation';

        const fetchOptions = {
            query: gql`${query}`,
            variables,
            context: {
                headers
            }
        };

        try {
            const { data, errors } = isMutation
                ? await client.mutate({ mutation: gql`${query}`, variables, context: { headers } })
                : await client.query({ query: gql`${query}`, variables, context: { headers } });

            return { data, errors };
        } catch (error) {
            console.error("Remote execution error:", error);
            return { errors: [error] };
        }
    };

    return wrapSchema({
        schema: await schemaFromExecutor(executor),
        executor,
    });
}

async function startGateway() {
    try {
        console.log('--- Starting API Gateway ---');

        console.log('Loading remote schemas with retry...');

        const loadSchemaWithRetry = async (url, serviceName) => {
            const MAX_RETRIES = 10;
            const RETRY_DELAY = 3000;

            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    const schema = await createRemoteSchema(url);
                    console.log(`✅ ${serviceName} Schema loaded`);
                    return schema;
                } catch (error) {
                    console.log(`⚠️ Failed to load ${serviceName} (Attempt ${i + 1}/${MAX_RETRIES}). Retrying in 3s...`);
                    if (i === MAX_RETRIES - 1) throw error;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
            }
        };

        const venueSchema = await loadSchemaWithRetry(VENUE_SERVICE_URL, 'Venue Service');
        const logisticsSchema = await loadSchemaWithRetry(LOGISTICS_SERVICE_URL, 'Logistics Service');
        const inventorySchema = await loadSchemaWithRetry(INVENTORY_SERVICE_URL, 'Inventory Consumer');

        // --- Local Auth Schema ---
        const authTypeDefs = gql`
            type User {
                id: ID
                name: String
                email: String
                role: String
            }
            type AuthResponse {
                token: String
                user: User
                message: String
            }
            type Mutation {
                register(name: String!, email: String!, password: String!, role: String): AuthResponse
                login(email: String!, password: String!): AuthResponse
            }
        `;

        const authResolvers = {
            Mutation: {
                register: async (_, { name, email, password, role }) => {
                    try {
                        const response = await fetch('http://localhost:4001/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, email, password, role })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message || 'Registration failed');
                        return {
                            message: "User registered successfully",
                            user: data.user // Assuming API returns user data, might need adjustment based on actual API response
                        };
                    } catch (error) {
                        throw new Error(error.message);
                    }
                },
                login: async (_, { email, password }) => {
                    try {
                        const response = await fetch('http://localhost:4001/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message || 'Login failed');
                        return {
                            token: data.token,
                            message: "Login successful"
                        };
                    } catch (error) {
                        throw new Error(error.message);
                    }
                }
            }
        };


        const gatewaySchema = stitchSchemas({
            subschemas: [
                { schema: venueSchema },
                { schema: logisticsSchema },
                { schema: inventorySchema }
            ],
            typeDefs: authTypeDefs,
            resolvers: authResolvers
        });

        const server = new ApolloServer({
            schema: gatewaySchema,
            context: ({ req }) => {
                const authHeader = req.headers.authorization || '';
                const token = authHeader.split(' ')[1];

                if (!token) {
                    // We can allow introspection without a token if needed, 
                    // but for now, let's keep it strict or allow selective operations.
                    // If you want to force login for EVERYTHING:
                    // throw new AuthenticationError('You must be logged in');
                    return { user: null };
                }

                try {
                    const user = jwt.verify(token, JWT_SECRET);
                    return { user, token };
                } catch (err) {
                    console.error('Invalid token:', err.message);
                    return { user: null };
                }
            },
            cors: {
                origin: "*",
                credentials: true
            },
            introspection: true
        });

        const PORT = process.env.PORT || 4000;
        server.listen({ port: PORT }).then(({ url }) => {
            console.log(`🚀 API Gateway ready at ${url}`);
            console.log(`📡 Use Postman or other clients to test against: ${url}graphql`);
        });

    } catch (error) {
        console.error('❌ Failed to start API Gateway:', error.message);
    }
}

startGateway();
