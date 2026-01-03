const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Venue = require('./Venue');

const Room = db.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    venueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Venue,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    facilities: {
        type: DataTypes.JSON, // Storing facilities as a JSON array
        allowNull: true
    },
}, {
    tableName: 'rooms',
    timestamps: true
});

// Define Relationship
Venue.hasMany(Room, { foreignKey: 'venueId', onDelete: 'CASCADE' });
Room.belongsTo(Venue, { foreignKey: 'venueId' });

module.exports = Room;
