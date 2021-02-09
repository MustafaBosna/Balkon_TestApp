const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser')


console.log(__dirname);

dotenv.config({
    path: "./.env"
})

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: 'root',
    password: '',
    database: process.env.DATABASE_NAME

});


db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("mysql connected");
    }
})


const app = express();
const publicDirectory = path.join(__dirname, './public')

app.use(express.static(publicDirectory));
// parse url encoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

// Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


const port = 5001;

app.listen(port, () => {
    console.log(`Server started on ${port}!`)
});