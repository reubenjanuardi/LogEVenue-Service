const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLBoolean, GraphQLID, GraphQLList } = require('graphql');
const checkController = require('../controllers/checkController');

const VenueStatusType = new GraphQLObjectType({
    name: 'VenueStatus',
    fields: () => ({
        available: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        room: { type: GraphQLString } // Simplified for GraphQL
    })
});

const ItemStatusType = new GraphQLObjectType({
    name: 'ItemStatus',
    fields: () => ({
        name: { type: GraphQLString },
        status: { type: GraphQLString },
        itemId: { type: GraphQLID }
    })
});

const LogisticsStatusType = new GraphQLObjectType({
    name: 'LogisticsStatus',
    fields: () => ({
        available: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        items: { type: new GraphQLList(ItemStatusType) }
    })
});

const FeasibilityReportType = new GraphQLObjectType({
    name: 'FeasibilityReport',
    fields: () => ({
        eventId: { type: GraphQLString },
        feasibility: { type: GraphQLBoolean },
        venue: { type: VenueStatusType },
        logistics: { type: LogisticsStatusType }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        checkFeasibility: {
            type: FeasibilityReportType,
            args: { eventId: { type: GraphQLString } },
            async resolve(parent, args) {
                // We wrap the controller logic or call a service
                // For now, let's reuse controller logic by passing a mock req/res if needed
                // Better: Extract logic to a service (but let's keep it simple for now)
                const result = await checkController.internalCheckFeasibility(args.eventId);
                return result;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});
