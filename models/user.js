const Sequelize = require("sequelize");
const sequelize = require("../db/database");
const UserAddress = require('../models/UserAddress');
const UploadImages = require('../models/uploadImages');

const User = sequelize.define("users", {

    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    about: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    birthday: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    education: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
    },
    favorite_food: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    gender: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    height: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    firebase_id: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    profession: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    profile_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    sign: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    admin_status: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    device_type: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    latitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    longitude: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    state: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: false
    }

});


User.hasMany(UserAddress, { foreignKey: 'user_id' });
UserAddress.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UploadImages, { foreignKey: 'user_id' });
UploadImages.belongsTo(User, { foreignKey: 'user_id' });

module.exports = User;