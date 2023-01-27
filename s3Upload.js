const Aws = require('aws-sdk');
const uuid = require("uuid").v4;

exports.s3Uploadv2 = async(file) => {
    const s3 = new Aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY // secretAccessKey is also store in .env file
    })

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME, // bucket that we made earlier
        Key: `images/dyey/${uuid()}-${file.originalname}`, // Name of the image
        Body: file.buffer, // Body which will contain the image in buffer format
    };

    // s3.upload(params, (error, data) => {
    //     if (error) {
    //         res.status(500).send({ "err": error }) // if we get any error while uploading error message will be returned.
    //     } else {
    //         console.log(data)
    //     }
    // })
    return await s3.upload(params).promise();
}