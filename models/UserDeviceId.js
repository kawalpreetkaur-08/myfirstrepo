const Sequelize = require("sequelize");
const sequelize = require("../db/database");

const UserDeviceId = sequelize.define("user_device_ids", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    device_id: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    device_type: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    firebase_token: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = UserDeviceId;