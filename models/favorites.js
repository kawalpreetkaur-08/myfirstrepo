const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const favorite = sequelize.define("favorites", {

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
    favorites_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
});



module.exports = favorite;