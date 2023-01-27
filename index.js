require('dotenv').config(); //const dotenv = require('dotenv');
const express = require('express');
const auth_router = require('./routes/auth');
const app = express();
const port = 8003
const bodyparser = require("body-parser");

app.set('view engine', 'ejs');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }))


app.use('/', auth_router);


app.listen(port, (err) => {
    if (err)
        throw err
    else
        console.log(`Server is listening on port http://localhost:${port}...`)
})