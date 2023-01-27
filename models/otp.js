const Sequelize = require("sequelize");
const sequelize = require("../db/database");

const Otp = sequelize.define("otps", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    code: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    expire_at: {
        type: Sequelize.DATE,
        allowNull: true,
    }
});

module.exports = Otp;