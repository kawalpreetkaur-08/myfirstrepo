const express = require("express");
const router = express.Router();
const controller = require('../controllers/authcontroller');
const multer = require('multer');
const { verifyAccessToken } = require('../jwt/jwt');
const { destroyToken } = require('../jwt/jwt');


const storage = multer.memoryStorage();

// below variable is define to check the type of file which is uploaded

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// defining the upload variable for the configuration of photo being uploaded
const upload = multer({
    storage,
    fileFilter
});




router.post('/register', upload.single("file"), controller.register);
router.get('/signin', controller.signin);
router.get('/profile', verifyAccessToken, controller.profile);

router.post('/user-details', controller.user_details);
router.get('/forgot-password', controller.forgot_password);
router.get('/verify-otp', controller.verify_otp);
router.get('/confirm-password', controller.confirm_password);
router.post('/upload-images', upload.array("file"), controller.upload_images);
router.get('/home', verifyAccessToken, controller.home);
router.get('/filter-options', controller.filter_options);
router.get('/single-user-details', controller.single_user_details);
router.post('/block-user', controller.block_user);
router.post('/report-photos', controller.report_photos);
router.post('/edit-profile', upload.fields([{
        name: "driving_licence_front_img",
        maxCount: 1,
    },
    {
        name: "driving_licence_back_img",
        maxCount: 1,
    }, ,
    {
        name: "profile_image",
        maxCount: 1,
    }
]), controller.edit_profile);

router.post('/favorites', controller.favorites);
router.get('/my-favorites', verifyAccessToken, controller.my_favorites);

router.post('/id_proof', upload.fields([{
        name: "driving_licence_front_img",
        maxCount: 1,
    },
    {
        name: "driving_licence_back_img",
        maxCount: 1,
    }
]), controller.id_proof);


router.get('/delete-account', controller.delete_account);

// router.post('/logout', destroyToken, controller.logout);

router.get('/terms-conditions', controller.terms_conditions);
router.get('/contact-support', controller.contact_support);


module.exports = router;