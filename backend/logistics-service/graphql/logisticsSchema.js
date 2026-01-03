const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLBoolean } = require('graphql');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

// --- Types ---
const ItemType = new GraphQLObjectType({
    name: 'Item',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        category: { type: GraphQLString },
        totalStock: { type: GraphQLInt },
        availableStock: { type: GraphQLInt }
    })
});

const TransactionType = new GraphQLObjectType({
    name: 'Transaction',
    fields: () => ({
        id: { type: GraphQLID },
        itemId: { type: GraphQLID },
        eventId: { type: GraphQLID },
        borrowerName: { type: GraphQLString },
        quantity: { type: GraphQLInt },
        type: { type: GraphQLString },
        status: { type: GraphQLString },
        item: {
            type: ItemType,
            resolve(parent) {
                return Item.findByPk(parent.itemId);
            }
        }
    })
});

// --- Root Query ---
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        item: {
            type: ItemType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Item.findByPk(args.id);
            }
        },
        items: {
            type: new GraphQLList(ItemType),
            resolve(parent, args) {
                return Item.findAll();
            }
        },
        transactions: {
            type: new GraphQLList(TransactionType),
            resolve(parent, args) {
                return Transaction.findAll();
            }
        }
    }
});

// --- Mutations ---
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addItem: {
            type: ItemType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLString },
                category: { type: new GraphQLNonNull(GraphQLString) },
                totalStock: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, args) {
                return Item.create({
                    name: args.name,
                    description: args.description,
                    category: args.category,
                    totalStock: args.totalStock,
                    availableStock: args.totalStock // Initially available = total
                });
            }
        },
        borrowItem: {
            type: TransactionType,
            args: {
                itemId: { type: new GraphQLNonNull(GraphQLID) },
                quantity: { type: new GraphQLNonNull(GraphQLInt) },
                eventId: { type: GraphQLInt },
                borrowerName: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const item = await Item.findByPk(args.itemId);
                if (!item) throw new Error("Item not found");
                if (item.availableStock < args.quantity) throw new Error("Insufficient stock");

                const transaction = await Transaction.create({
                    itemId: args.itemId,
                    quantity: args.quantity,
                    eventId: args.eventId,
                    borrowerName: args.borrowerName,
                    type: 'BORROW',
                    status: 'APPROVED'
                });

                item.availableStock -= args.quantity;
                await item.save();

                return transaction;
            }
        }
        // Return item mutation can be added similarly
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
