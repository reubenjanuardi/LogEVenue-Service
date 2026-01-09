const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLFloat, GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean } = require("graphql");
const Venue = require("../models/Venue");
const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const { Op } = require("sequelize");

// --- Types ---
const VenueType = new GraphQLObjectType({
  name: "Venue",
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
      },
    },
  }),
});

const RoomType = new GraphQLObjectType({
  name: "Room",
  fields: () => ({
    id: { type: GraphQLID },
    venueId: { type: GraphQLID },
    name: { type: GraphQLString },
    capacity: { type: GraphQLInt },
    facilities: {
      type: new GraphQLList(GraphQLString),
      resolve(parent) {
        return parent.facilities || [];
      },
    },
    venue: {
      type: VenueType,
      resolve(parent) {
        return Venue.findByPk(parent.venueId);
      },
    },
  }),
});

const ReservationType = new GraphQLObjectType({
  name: "Reservation",
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
      },
    },
  }),
});

// NEW: Availability Check Result Type
const AvailabilityType = new GraphQLObjectType({
  name: "Availability",
  fields: () => ({
    available: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    conflictingReservations: { type: new GraphQLList(ReservationType) },
  }),
});

// NEW: Time Slot Type
const TimeSlotType = new GraphQLObjectType({
  name: "TimeSlot",
  fields: () => ({
    startTime: { type: GraphQLString },
    endTime: { type: GraphQLString },
    available: { type: GraphQLBoolean },
  }),
});

// NEW: Room Availability Type
const RoomAvailabilityType = new GraphQLObjectType({
  name: "RoomAvailability",
  fields: () => ({
    roomId: { type: GraphQLID },
    roomName: { type: GraphQLString },
    date: { type: GraphQLString },
    available: { type: GraphQLBoolean },
    timeSlots: { type: new GraphQLList(TimeSlotType) },
  }),
});

// --- Root Query ---
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    venue: {
      type: VenueType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Venue.findByPk(args.id);
      },
    },
    venues: {
      type: new GraphQLList(VenueType),
      resolve(parent, args) {
        return Venue.findAll();
      },
    },
    rooms: {
      type: new GraphQLList(RoomType),
      args: { venueId: { type: GraphQLID } },
      resolve(parent, args) {
        if (args.venueId) return Room.findAll({ where: { venueId: args.venueId } });
        return Room.findAll();
      },
    },
    // NEW: Check room availability
    checkRoomAvailability: {
      type: AvailabilityType,
      args: {
        roomId: { type: new GraphQLNonNull(GraphQLID) },
        startTime: { type: new GraphQLNonNull(GraphQLString) },
        endTime: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { roomId, startTime, endTime } = args;

        const existingReservation = await Reservation.findOne({
          where: {
            roomId,
            status: "confirmed",
            [Op.or]: [
              {
                startTime: {
                  [Op.between]: [startTime, endTime],
                },
              },
              {
                endTime: {
                  [Op.between]: [startTime, endTime],
                },
              },
              {
                startTime: {
                  [Op.lte]: startTime,
                },
                endTime: {
                  [Op.gte]: endTime,
                },
              },
            ],
          },
        });

        if (existingReservation) {
          return {
            available: false,
            message: "Room is already booked for this time slot.",
            conflictingReservations: [existingReservation],
          };
        }

        return {
          available: true,
          message: "Room is available.",
          conflictingReservations: [],
        };
      },
    },
    // NEW: Get room availability for a specific date
    roomAvailabilityByDate: {
      type: RoomAvailabilityType,
      args: {
        roomId: { type: new GraphQLNonNull(GraphQLID) },
        date: { type: new GraphQLNonNull(GraphQLString) }, // YYYY-MM-DD
      },
      async resolve(parent, args) {
        const { roomId, date } = args;

        const room = await Room.findByPk(roomId);
        if (!room) {
          throw new Error("Room not found");
        }

        // Get all reservations for this room on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const reservations = await Reservation.findAll({
          where: {
            roomId,
            status: "confirmed",
            startTime: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
          order: [["startTime", "ASC"]],
        });

        // Generate time slots (8 AM to 10 PM in 2-hour blocks)
        const timeSlots = [];
        for (let hour = 8; hour < 22; hour += 2) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, 0, 0, 0);

          const slotEnd = new Date(date);
          slotEnd.setHours(hour + 2, 0, 0, 0);

          // Check if this slot conflicts with any reservation
          const isAvailable = !reservations.some((res) => {
            const resStart = new Date(res.startTime);
            const resEnd = new Date(res.endTime);

            return (slotStart >= resStart && slotStart < resEnd) || (slotEnd > resStart && slotEnd <= resEnd) || (slotStart <= resStart && slotEnd >= resEnd);
          });

          timeSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: isAvailable,
          });
        }

        return {
          roomId: room.id,
          roomName: room.name,
          date,
          available: timeSlots.some((slot) => slot.available),
          timeSlots,
        };
      },
    },
    // NEW: Get reservations by room
    reservationsByRoom: {
      type: new GraphQLList(ReservationType),
      args: {
        roomId: { type: new GraphQLNonNull(GraphQLID) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const { roomId, startDate, endDate } = args;

        const where = { roomId, status: "confirmed" };

        if (startDate && endDate) {
          where.startTime = {
            [Op.between]: [new Date(startDate), new Date(endDate)],
          };
        }

        return Reservation.findAll({ where, order: [["startTime", "ASC"]] });
      },
    },
  },
});

// --- Mutations ---
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addVenue: {
      type: VenueType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        address: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        imageUrl: { type: GraphQLString },
      },
      resolve(parent, args) {
        return Venue.create({
          name: args.name,
          address: args.address,
          description: args.description,
          imageUrl: args.imageUrl,
        });
      },
    },
    addRoom: {
      type: RoomType,
      args: {
        venueId: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        capacity: { type: new GraphQLNonNull(GraphQLInt) },
        facilities: { type: new GraphQLList(GraphQLString) },
      },
      resolve(parent, args) {
        return Room.create({
          venueId: args.venueId,
          name: args.name,
          capacity: args.capacity,
          facilities: args.facilities,
        });
      },
    },
    // NEW: Create reservation/booking
    createReservation: {
      type: ReservationType,
      args: {
        roomId: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        startTime: { type: new GraphQLNonNull(GraphQLString) },
        endTime: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const { roomId, userId, startTime, endTime, status = "confirmed" } = args;

        // Check for conflicts
        const conflict = await Reservation.findOne({
          where: {
            roomId,
            status: "confirmed",
            [Op.or]: [{ startTime: { [Op.between]: [startTime, endTime] } }, { endTime: { [Op.between]: [startTime, endTime] } }, { startTime: { [Op.lte]: startTime }, endTime: { [Op.gte]: endTime } }],
          },
        });

        if (conflict) {
          throw new Error("Time slot conflict. Room is already booked for this time.");
        }

        // Create reservation
        return Reservation.create({
          roomId,
          userId,
          startTime,
          endTime,
          status,
        });
      },
    },
    // NEW: Cancel reservation
    cancelReservation: {
      type: ReservationType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        const reservation = await Reservation.findByPk(args.id);

        if (!reservation) {
          throw new Error("Reservation not found");
        }

        reservation.status = "cancelled";
        await reservation.save();

        return reservation;
      },
    },
    // NEW: Update reservation
    updateReservation: {
      type: ReservationType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        startTime: { type: GraphQLString },
        endTime: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const { id, startTime, endTime, status } = args;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
          throw new Error("Reservation not found");
        }

        // If updating time, check for conflicts
        if (startTime || endTime) {
          const newStartTime = startTime || reservation.startTime;
          const newEndTime = endTime || reservation.endTime;

          const conflict = await Reservation.findOne({
            where: {
              id: { [Op.ne]: id },
              roomId: reservation.roomId,
              status: "confirmed",
              [Op.or]: [{ startTime: { [Op.between]: [newStartTime, newEndTime] } }, { endTime: { [Op.between]: [newStartTime, newEndTime] } }, { startTime: { [Op.lte]: newStartTime }, endTime: { [Op.gte]: newEndTime } }],
            },
          });

          if (conflict) {
            throw new Error("Time slot conflict with another reservation");
          }
        }

        // Update fields
        if (startTime) reservation.startTime = startTime;
        if (endTime) reservation.endTime = endTime;
        if (status) reservation.status = status;

        await reservation.save();

        return reservation;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
