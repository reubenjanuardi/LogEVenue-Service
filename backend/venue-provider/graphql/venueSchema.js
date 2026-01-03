const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean } = require('graphql');
const Venue = require('../models/Venue');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');

// --- Types ---
const VenueType = new GraphQLObjectType({
    name: 'Venue',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        address: { type: GraphQLString },
        description: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
        rooms: {
            type: new GraphQLList(RoomType),
            resolve(parent, args) {
                return Room.findAll({ where: { venueId: parent.id } });
            }
        }
    })
});

const RoomType = new GraphQLObjectType({
    name: 'Room',
    fields: () => ({
        id: { type: GraphQLID },
        venueId: { type: GraphQLID },
        name: { type: GraphQLString },
        capacity: { type: GraphQLInt },
        facilities: { 
            type: new GraphQLList(GraphQLString), // Simple String array for facilities
            resolve(parent) {
                return parent.facilities || [];
            }
        },
        venue: {
            type: VenueType,
            resolve(parent) {
                return Venue.findByPk(parent.venueId);
            }
        }
    })
});

const ReservationType = new GraphQLObjectType({
    name: 'Reservation',
    fields: () => ({
        id: { type: GraphQLID },
        roomId: { type: GraphQLInt },
        userId: { type: GraphQLInt },
        startTime: { type: GraphQLString },
        endTime: { type: GraphQLString },
        status: { type: GraphQLString },
        room: {
            type: RoomType,
            resolve(parent) {
                return Room.findByPk(parent.roomId);
            }
        }
    })
});

// --- Root Query ---
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        venue: {
            type: VenueType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Venue.findByPk(args.id);
            }
        },
        venues: {
            type: new GraphQLList(VenueType),
            resolve(parent, args) {
                return Venue.findAll();
            }
        },
        rooms: {
            type: new GraphQLList(RoomType),
            args: { venueId: { type: GraphQLID } },
            resolve(parent, args) {
                if (args.venueId) return Room.findAll({ where: { venueId: args.venueId } });
                return Room.findAll();
            }
        }
    }
});

// --- Mutations ---
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addVenue: {
            type: VenueType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                address: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                imageUrl: { type: GraphQLString }
            },
            resolve(parent, args) {
                return Venue.create({
                    name: args.name,
                    address: args.address,
                    description: args.description,
                    imageUrl: args.imageUrl
                });
            }
        },
        addRoom: {
            type: RoomType,
            args: {
                venueId: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                capacity: { type: new GraphQLNonNull(GraphQLInt) },
                facilities: { type: new GraphQLList(GraphQLString) }
            },
            resolve(parent, args) {
                return Room.create({
                    venueId: args.venueId,
                    name: args.name,
                    capacity: args.capacity,
                    facilities: args.facilities
                });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
