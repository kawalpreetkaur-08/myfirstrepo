const JWT = require('jsonwebtoken');
// const redis = require('redis');

// var JWTR = require('jwt-redis').default;

// var redisClient = redis.createClient();

// var jwtr = new JWTR(redisClient);
const createError = require('http-errors');
//var mysql = require('mysql')



module.exports = {
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, 'bezkoder-secret-key', (err, payload) => {
            if (err) {
                res.sendStatus(403);
            } else {
                req.payload = payload
                next()
            }

        })
    }
}


// destroyToken: (req, res, next) => {

//     if (!req.headers['authorization']) return next(createError.Unauthorized())
//     const authHeader = req.headers['authorization']
//     const bearerToken = authHeader.split(' ')
//     const token = bearerToken[1]

//     // const bearerHeader = req.headers["authorization"];

//     // if (typeof bearerHeader !== "undefined") {

//     //     const bearerToken = bearerHeader.split(" ")[1];

//     //     //req.token = bearerToken;
//     //     const token = bearerToken;
//     JWT.decode(token, (err) => {
//         if (err) {
//             res.sendStatus(403);
//         } else {
//             res.sendStatus(200);
//         }
//     })
// }




// destroyToken: (req, res, next) => {
//     if (!req.headers['authorization']) return next(createError.Unauthorized())
//     const authHeader = req.headers['authorization']
//     const bearerToken = authHeader.split(' ')
//     const token = bearerToken[1]
//     JWT.deleteOne(token, 'bezkoder-secret-key', (err, payload) => {
//         if (err) {
//             res.sendStatus(403);
//         } else {
//             res.sendStatus(200);
//         }

//     })
// }