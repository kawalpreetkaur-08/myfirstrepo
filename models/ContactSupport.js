const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const contact_support = sequelize.define("contact_supports", {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    topic: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});



module.exports = contact_support;