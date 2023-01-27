const Userdb = require('../models/user');
const bcrypt = require('bcrypt');
const redis = require("redis");
var jwt = require("jsonwebtoken");
const UserDeviceId = require('../models/UserDeviceId');
const UserAddress = require('../models/UserAddress');
const { s3Uploadv2 } = require("./../s3Upload");
const Otp = require('../models/otp');
const nodemailer = require('nodemailer');
const image = require('../models/uploadImages');
const { Op } = require("sequelize");
const sequelize = require("../db/database");
const { QueryTypes } = require('sequelize');
const BlockUser = require('../models/blockusers');
const ReportPhoto = require('../models/reportphotos');
const favorite = require('../models/favorites');
const idproof = require('../models/idproof');
const { request } = require('express');
const term_condition = require('../models/TermsConditions');
const contact_support = require('../models/ContactSupport');


exports.register = async(req, res) => {

    const doesExist = await Userdb.findOne({ where: { email: req.body.email } });
    if (doesExist) {

        return res.status(200).send({
            status: false,
            message: "Email already exist"
        });
    }

    // const users = await Userdb.findAll();


    let result = await s3Uploadv2(req.file);
    var url = result.Location;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    const currentDate = new Date().getFullYear()

    const userbirthday = req.body.birthday;

    var userbirthyear = userbirthday.substr(userbirthday.length - 4);

    var age = currentDate - userbirthyear;


    await Userdb.create({
            about: req.body.about,
            birthday: req.body.birthday,
            education: req.body.education,
            email: req.body.email,
            favorite_food: req.body.favorite_food,
            first_name: req.body.first_name,
            gender: req.body.gender,
            height: req.body.height,
            firebase_id: req.body.firebase_id,
            last_name: req.body.last_name,
            profession: req.body.profession,
            profile_image_url: url,
            sign: req.body.sign,
            age: age,
            admin_status: req.body.admin_status,
            city: req.body.city,
            device_type: req.body.device_type,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            state: req.body.state,
            password: hashedPassword
        }).then(function(user) {

            if (req.body.device_id !== null) {
                UserDeviceId.findOne({
                    where: {
                        device_id: req.body.device_id,
                        user_id: user.id
                    }
                }).then(device_token => {

                    if (device_token) {

                        UserDeviceId.update({
                            firebase_token: req.body.firebase_token,
                        }, { where: { user_id: user.id } })


                    } else {


                        const device_id = {
                            user_id: user.id,
                            device_id: req.body.device_id,
                            firebase_token: req.body.firebase_token,
                            device_type: req.body.device_type,
                        };
                        UserDeviceId.create(device_id)


                    }

                })
            }

            var token = jwt.sign({ id: user.id }, "bezkoder-secret-key", {
                expiresIn: 86400 // 24 hours
            });

            res.send({ status: true, message: "Signup Successfully !", token: token, user_id: user.id });
        })
        .catch(err => {
            res.send(err);
        })

}

exports.signin = async(req, res) => {

    try {
        const user = await Userdb.findOne({ where: { email: req.body.email } });
        // Username/email does NOT exist

        if (!user) {

            return res.status(200).send({
                status: false,
                message: "Email not registered"
            });
        }

        // Email exist and now we need to verify the password
        const isMatch = await bcrypt.compareSync(req.body.password, user.password);

        if (!isMatch) {

            return res.status(200).send({
                status: false,
                message: "Incorrect password"
            });

        }

        const users = await Userdb.findOne({
            where: { id: user.id }
        });

        const currentDate = new Date().getFullYear()

        const userbirthday = users.birthday;

        var userbirthyear = userbirthday.substr(userbirthday.length - 4);

        var age = currentDate - userbirthyear;

        await Userdb.update({
            age: age
        }, { where: { id: user.id } })


        if (req.body.device_id !== null) {
            UserDeviceId.findOne({
                where: {
                    device_id: req.body.device_id,
                    user_id: user.id
                }
            }).then(device_token => {

                if (device_token) {

                    UserDeviceId.update({
                        firebase_token: req.body.firebase_token,
                    }, { where: { user_id: user.id } })


                } else {


                    const device_id = {
                        user_id: user.id,
                        device_id: req.body.device_id,
                        firebase_token: req.body.firebase_token,
                        device_type: req.body.device_type,
                    };
                    UserDeviceId.create(device_id)


                }
            })
        }


        var token = jwt.sign({ id: user.id }, "bezkoder-secret-key", {
            expiresIn: 86400 // 24 hours
        });

        return res.status(200).send({
            status: true,
            message: "Signin Successfully !",
            token: token,
            user_id: user.id,
        });
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }
};


exports.forgot_password = async(req, res) => {


    const user = await Userdb.findOne({ where: { email: req.body.email } });



    if (user) {
        Otp.findOne({
            where: {
                email: req.body.email
            }
        }).then(otp => {

            const minutesToAdd = 2
            const currentDate = new Date()
            const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000)
            var otp_code = Math.floor(100000 + Math.random() * 900000);

            if (otp) {
                Otp.update({
                    code: otp_code,
                    expire_at: futureDate
                }, { where: { email: req.body.email } })
            } else {
                console.log("yesss")
                const optData = {
                    email: req.body.email,
                    user_id: user.id,
                    code: otp_code,
                    expire_at: futureDate
                };
                const otpResponse = Otp.create(optData)
            }

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.USER_EMAIL,
                    pass: process.env.PASS,
                }
            });

            var mailOptions = {
                from: process.env.USER_EMAIL,
                to: req.body.email,
                subject: 'Sending otp for password change',
                text: 'Change your password using this otp ' + otp_code
            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return res.status(200).send({
                        status: false,
                        message: "Failed",
                    });
                } else {
                    return res.status(200).send({
                        status: true,
                        message: "Email Sent"
                    });
                }
            });
        })

    } else {
        res.status(200).send({
            status: false,
            message: "user not found"
        });
    }

}


exports.verify_otp = async(req, res) => {

    const currentDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')


    const verifyOtp = await Otp.findOne({ where: { user_id: req.body.user_id, code: req.body.code } });
    if (verifyOtp) {

        if (verifyOtp.expire_at > currentDate) {

            res.send({ status: true, message: "Otp Verified!", user_id: req.body.user_id });
        } else {
            res.send({ status: false, message: "OTP expired!!" });
        }

        // res.send({ status: true, message: "Otp Matched" });
    } else {
        res.send({ status: false, message: "Invalid Otp" });
    }
}


exports.confirm_password = async(req, res) => {

    try {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);


        const user = await Userdb.findOne({ where: { id: req.body.id } });

        if (user) {
            Userdb.update({
                    password: hashedPassword
                }, { where: { id: req.body.id } })
                .then(data => {
                    if (!data) {
                        res.status(404).send({ status: false, message: `Cannot Update user with ${id}. Maybe user not found!` })
                    } else {
                        //req.flash('success', 'User has been update Successfully');
                        res.status(200).send({
                            status: true,
                            message: "Password updated"
                        });
                    }
                })
        } else {
            res.status(404).send({ status: false, message: `user not found!` })
        }
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }
};



exports.profile = async(req, res, next) => {
    const Userdata = await Userdb.findByPk(req.payload.id)

    if (Userdata) {
        res.send({ status: true, message: "User Details", user: Userdata });

    } else {
        res.send({ status: false, message: "User not found" });
    }
}



exports.user_details = async(req, res) => {

    // User.hasOne(UserAddress);
    // UserAddress.belongsTo(User);

    const users = await Userdb.findOne({
        where: { id: req.body.user_id },
        include: [{
            model: UserAddress,
            attributes: ['address']
        }],
        attributes: ['id', 'birthday']
    });

    let obj = {}

    obj['id'] = users.id;
    obj['birthday'] = users.birthday;
    obj['address'] = users.user_addresses[0].address;


    res.send({ status: true, message: "User Details", user: obj });

    // console.log(JSON.stringify(users, null, 2));

}


exports.upload_images = async(req, res) => {

    // User.hasOne(UserAddress);
    // UserAddress.belongsTo(User);
    //console.log(req.files);

    var array = [];

    var files = req.files;
    for (let i = 0; i < files.length; i++) {


        let result = await s3Uploadv2(files[i]);
        var url = result.Location;

        //console.log(url)

        array.push(url);


    }

    //console.log(array)

    var link = array.toString();
    // console.log(link);
    // var newarr = link.split();
    // console.log(newarr);


    await image.create({
        user_id: req.body.user_id,
        images: link
    }).then(data => {
        if (!data) {
            res.status(404).send({ status: false, message: `User not found!` })
        } else {
            //req.flash('success', 'User has been update Successfully');
            res.status(200).send({
                status: true,
                message: "Images uploaded successfully"
            });
        }
    })
}
exports.home = async(req, res) => {
    try {

        const block_users = await BlockUser.findAll({
            where: { user_id: req.payload.id }
        });

        var array = [];

        for (let i = 0; i < block_users.length; i++) {
            array.push(block_users[i].block_user_id);

        }

        const user_details = await Userdb.findAll({
            where: {
                id: {
                    [Op.notIn]: array
                }
            }
        });

        if (user_details) {
            res.status(200).send({
                status: true,
                user_details: user_details,
                message: "Details found"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Details not found"
            });
        }
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }
}

exports.filter_options = async(req, res) => {


    var query = "SELECT * , ( 6371 * acos ( cos ( radians(" + req.body.lat + ")) * cos(radians(latitude)) * cos(radians(longitude) - radians(" + req.body.long + ")) + sin(radians(" + req.body.lat + ")) * sin(radians(latitude)))) AS distance FROM users HAVING distance >= " + req.body.min_dist + " AND distance <= " + req.body.max_dist + " AND age >= " + req.body.min_age + " AND age <= " + req.body.max_age + "";

    const filter_users = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.status(200).send({
        status: true,
        users: filter_users,
        message: "Details found"
    });
}

exports.single_user_details = async(req, res) => {


    // const userimages = await image.findOne({
    //     where: { id: req.body.user_id }



    // });


    const users = await Userdb.findOne({
        where: { id: req.body.user_id },
        include: [{
            model: image,
            attributes: ['images']
        }]
    });

    let obj = {}

    obj['id'] = users.id;
    obj['about'] = users.about;
    obj['birthday'] = users.birthday;
    obj['education'] = users.education;
    obj['birthday'] = users.birthday;
    obj['email'] = users.email;
    obj['favorite_food'] = users.favorite_food;
    obj['first_name'] = users.first_name;
    obj['gender'] = users.gender;
    obj['height'] = users.height;
    obj['firebase_id'] = users.firebase_id;
    obj['last_name'] = users.last_name;
    obj['profession'] = users.profession;
    obj['profile_image_url'] = users.profile_image_url;
    obj['sign'] = users.sign;
    obj['admin_status'] = users.admin_status;
    obj['city'] = users.city;
    obj['device_type'] = users.device_type;
    obj['latitude'] = users.latitude;
    obj['longitude'] = users.longitude;
    obj['state'] = users.state;
    obj['password'] = users.password;
    obj['age'] = users.age;


    obj['images'] = users.upload_images[0].images;

    var newarr = obj['images'].split(',');

    obj['images'] = newarr;

    if (users) {
        res.send({ status: true, message: "User Details", user: obj });
    } else {
        res.send({ status: false, message: "User not found" });
    }
}

exports.block_user = async(req, res) => {


    const doesExist = await BlockUser.findOne({ where: { user_id: req.body.user_id, block_user_id: req.body.block_user_id } });
    if (doesExist) {

        return res.status(200).send({
            status: false,
            message: "User already blocked"
        });
    }

    const users = await Userdb.findOne({
        where: { id: req.body.user_id }

    });
    await BlockUser.create({
        user_id: users.id,
        block_user_id: req.body.block_user_id
    }).then(data => {
        if (!data) {
            res.status(404).send({ status: false, message: `User not found!` })
        } else {
            //req.flash('success', 'User has been update Successfully');
            res.status(200).send({
                status: true,
                message: "Data uploaded successfully"
            });
        }
    })
}

exports.report_photos = async(req, res) => {


    const doesExist = await ReportPhoto.findOne({ where: { user_id: req.body.user_id, report_user_id: req.body.report_user_id } });
    if (doesExist) {

        return res.status(200).send({
            status: false,
            message: "Failed to report,User already reported"
        });
    } else {

        const users = await Userdb.findOne({
            where: { id: req.body.user_id }

        });
        await ReportPhoto.create({
            user_id: users.id,
            report_user_id: req.body.report_user_id,
            reason: req.body.reason
        }).then(data => {
            if (!data) {
                res.status(404).send({ status: false, message: `User not found!` })
            } else {
                //req.flash('success', 'User has been update Successfully');
                res.status(200).send({
                    status: true,
                    message: "Photo reported successfully"
                });
            }
        })
    }
}


exports.edit_profile = async(req, res) => {


    if (req.files.driving_licence_front_img) {

        let result1 = await s3Uploadv2(req.files.driving_licence_front_img[0]);
        var url_1 = result1.Location;
        await idproof.update({
            driving_licence_front_img: url_1
        }, { where: { user_id: req.body.user_id } })
    }

    if (req.files.driving_licence_back_img) {

        let result2 = await s3Uploadv2(req.files.driving_licence_back_img[0]);
        var url_2 = result2.Location;
        await idproof.update({
            driving_licence_back_img: url_2
        }, { where: { user_id: req.body.user_id } })
    }



    if (req.files.driving_licence_front_img && req.files.driving_licence_back_img) {

        let result1 = await s3Uploadv2(req.files.driving_licence_front_img[0]);
        var url_1 = result1.Location;

        let result2 = await s3Uploadv2(req.files.driving_licence_back_img[0]);
        var url_2 = result2.Location;

        const indentity_ids = {
            driving_licence_front_img: url_1,
            driving_licence_back_img: url_2
        };


        var id_proff = await idproof.update(indentity_ids, { where: { user_id: req.body.user_id } })

    }



    if (!req.files.profile_image) {

        await Userdb.update({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                gender: req.body.gender,
                birthday: req.body.birthday,
                education: req.body.education,
                height: req.body.height,
                profession: req.body.profession,
                favorite_food: req.body.favorite_food,
                birthday: req.body.birthday,
                education: req.body.education,
                favorite_food: req.body.favorite_food,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                about: req.body.about
            }, { where: { id: req.body.user_id } })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Update user.Maybe user not found!` })
                } else {
                    res.status(200).send({ message: `Data Updated successfully` })
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Error in Updating information" })
            })

    } else {

        let result = await s3Uploadv2(req.files.profile_image[0]);
        var url = result.Location;

        await Userdb.update({
                profile_image_url: url,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                gender: req.body.gender,
                birthday: req.body.birthday,
                education: req.body.education,
                height: req.body.height,
                profession: req.body.profession,
                favorite_food: req.body.favorite_food,
                birthday: req.body.birthday,
                education: req.body.education,
                favorite_food: req.body.favorite_food,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                about: req.body.about
            }, { where: { id: req.body.user_id } })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Update user.Maybe user not found!` })
                } else {
                    res.status(200).send({
                        status: true,
                        message: "Data Updated successfully"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Error in Updating user information" })
            })
    }
}




exports.favorites = async(req, res) => {

    const doesExist = await favorite.findOne({ where: { user_id: req.body.user_id, favorites_id: req.body.favorites_id } });
    if (doesExist) {

        favorite.destroy({
                where: {
                    user_id: req.body.user_id
                }
            })
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Delete.Maybe id is wrong` })
                } else {
                    //req.flash('danger', 'User has been deleted Successfully');
                    res.status(200).send({
                        status: true,
                        message: "Remove from favorites"
                    });
                }
            })
    } else {

        const users = await Userdb.findOne({
            where: { id: req.body.user_id }

        });
        await favorite.create({
            user_id: users.id,
            favorites_id: req.body.favorites_id
        }).then(data => {
            if (!data) {
                res.status(404).send({ status: false, message: `User not found!` })
            } else {
                //req.flash('success', 'User has been update Successfully');
                res.status(200).send({
                    status: true,
                    message: "Added to favorites"
                });
            }
        })
    }

}

exports.my_favorites = async(req, res) => {

    try {
        const myfavorite = await favorite.findAll({
            where: { user_id: req.payload.id }
        });

        var array = [];

        for (let i = 0; i < myfavorite.length; i++) {
            array.push(myfavorite[i].favorites_id);

        }
        //console.log(array);
        const user_details = await Userdb.findAll({
            where: {
                id: {
                    [Op.in]: array
                }
            }
        });

        if (user_details) {
            res.status(200).send({
                status: true,
                user_details: user_details,
                message: "Details found"
            });
        } else {
            res.status(200).send({
                status: false,
                message: "Details not found"
            });
        }
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }

}

exports.id_proof = async(req, res) => {

    const users = await Userdb.findOne({
        where: { id: req.body.user_id }

    });

    if (!req.files.driving_licence_front_img) {
        res.status(404).send({ status: false, message: `driving_licence_front_img is required` })
    } else {
        let result = await s3Uploadv2(req.files.driving_licence_back_img[0]);
        var url_1 = result.Location;
        console.log(url_1);
    }

    if (!req.files.driving_licence_back_img) {
        res.status(404).send({ status: false, message: `driving_licence_back_img is required` })
    } else {
        let result = await s3Uploadv2(req.files.driving_licence_back_img[0]);
        var url_2 = result.Location;
        console.log(url_2);
    }

    // const identity_proof = {
    //     service_provider_id: req.body.service_provider_id,
    //     driving_licence_front_img: url_1
    // }

    await idproof.create({
            user_id: users.id,
            driving_licence_front_img: url_1,
            driving_licence_back_img: url_2
        })
        .then(data => {
            if (!data) {
                res.status(404).send({ status: false, message: `Something went wrong` })
            } else {
                res.status(200).send({ status: true, message: `Information Submitted Successfully` })
            }
        })
        .catch(err => {
            res.status(500).send({ status: false, message: err })
        })

}



exports.delete_account = async(req, res) => {

    //const user = await Userdb.findOne({ where: { id: req.body.user_id } });
    //const doesExist = await Userdb.findOne({ where: { id: req.body.user_id } });


    await Userdb.destroy({
            where: {
                id: req.body.user_id
            }
        })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: `Cannot Delete. Maybe id is wrong` })
            } else {
                res.status(200).send({ message: `User has been deleted Successfully` })
            }
        })

    .catch(err => {
        res.status(500).send({
            message: "Could not delete User"
        });
    });

}


exports.terms_conditions = async(req, res) => {

    await term_condition.create({
        title: req.body.title,
        content: req.body.content
    }).then(data => {
        if (!data) {
            res.status(404).send({ status: false, message: `Error in updating data!` })
        } else {
            //req.flash('success', 'User has been update Successfully');
            res.status(200).send({
                status: true,
                message: "Data uploaded successfully"
            });
        }
    })

}

exports.contact_support = async(req, res) => {

    await contact_support.create({
        topic: req.body.topic,
        description: req.body.description
    }).then(data => {
        if (!data) {
            res.status(404).send({ status: false, message: `Error in updating data!` })
        } else {
            //req.flash('success', 'User has been update Successfully');
            res.status(200).send({
                status: true,
                message: "Data uploaded successfully"
            });
        }
    })

}