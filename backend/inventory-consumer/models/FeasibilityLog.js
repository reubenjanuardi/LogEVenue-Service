const { DataTypes } = require('sequelize');
const db = require('../config/database');

const FeasibilityLog = db.define('FeasibilityLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    eventTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isFeasible: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    venueStatus: {
        type: DataTypes.JSON,
        allowNull: true
    },
    logisticsStatus: {
        type: DataTypes.JSON,
        allowNull: true
    },
    checkedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'feasibility_logs',
    timestamps: false
});

module.exports = FeasibilityLog;
