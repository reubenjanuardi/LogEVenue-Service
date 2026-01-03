const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Item = require('./Item');

const Transaction = db.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Item,
            key: 'id'
        }
    },
    eventId: {
        type: DataTypes.INTEGER, // Reference to Event ID from Group A
        allowNull: true
    },
    borrowerName: {
        type: DataTypes.STRING, // Could be user ID or name
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('BORROW', 'RETURN'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'),
        defaultValue: 'PENDING'
    }
}, {
    tableName: 'transactions',
    timestamps: true
});

// Relationships
Item.hasMany(Transaction, { foreignKey: 'itemId' });
Transaction.belongsTo(Item, { foreignKey: 'itemId' });

module.exports = Transaction;
