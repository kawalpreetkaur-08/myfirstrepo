const Sequelize = require("sequelize");
const sequelize = require("../db/database");




const ReportPhoto = sequelize.define("reportphotos", {

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
    report_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    reason: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});



module.exports = ReportPhoto;