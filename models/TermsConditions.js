const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const term_condition = sequelize.define("terms_conditions", {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});



module.exports = term_condition;