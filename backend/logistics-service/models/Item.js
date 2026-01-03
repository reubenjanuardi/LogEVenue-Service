const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Item = db.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING, // e.g., 'Furniture', 'Electronics'
        allowNull: false
    },
    totalStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    },
    availableStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
}, {
    tableName: 'items',
    timestamps: true
});

module.exports = Item;
