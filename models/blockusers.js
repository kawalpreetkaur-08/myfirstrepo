const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const BlockUser = sequelize.define("blockusers", {

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
    block_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
});



module.exports = BlockUser;