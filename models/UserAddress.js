const Sequelize = require("sequelize");
const sequelize = require("../db/database");

const UserAddress = sequelize.define("user_addresses", {
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
    address: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = UserAddress;