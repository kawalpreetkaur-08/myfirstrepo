const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const idproof = sequelize.define("id_proofs", {

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
    driving_licence_front_img: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    driving_licence_back_img: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});



module.exports = idproof;