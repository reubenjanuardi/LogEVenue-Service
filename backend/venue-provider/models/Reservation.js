const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Room = require('./Room');

const Reservation = db.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Room,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'reservations',
    timestamps: true
});

// Define Relationship
Room.hasMany(Reservation, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = Reservation;
