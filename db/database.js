const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
    dialect: "mysql",
    host: process.env.HOST,
});

module.exports = sequelize;