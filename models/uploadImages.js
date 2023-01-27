const Sequelize = require("sequelize");
const sequelize = require("../db/database");

const UploadImages = sequelize.define("upload_images", {
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
    images: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});

module.exports = UploadImages;