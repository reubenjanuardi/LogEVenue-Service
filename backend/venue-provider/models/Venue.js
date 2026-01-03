const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Venue = db.define('Venue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'venues',
    timestamps: true
});

module.exports = Venue;
