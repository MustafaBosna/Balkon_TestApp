const mysql = require('mysql'); // import mysql DB 
const jwt = require('jsonwebtoken'); // jwt import
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { utimes } = require('fs');

dotenv.config({
    path: "./.env"
})

// Imports


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testapp'

});

exports.register = (req, res) => {
    console.log(req.body);

    const { login, email, password, passwordConfirm } = req.body;

    // Control Login Name in DB START
    db.query('SELECT name FROM user WHERE name = ?', [login], async(error, results) => {
        if (results.length > 0) {
            return res.render('register', {
                message: 'That login is already in use'
            });
        }
    });
    // Control Login Name in DB END


    // Check email value in DB
    db.query('SELECT email FROM user WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length > 0) {

            return res.render('register', {
                message: 'That email is already in use'
            });

        } else if (password !== passwordConfirm) {

            return res.render('register', {
                message: 'The password fields are not the same, please check it.'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        var sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)"; // Prepare SQL
        // Create connection to DB
        db.query(sql, [login, email, hashedPassword], function(err, result) {
            if (err) {
                console.log(err);
            } else {
                return res.render('register', {
                    message: 'User is successfully registered'
                });
            }
            return;
        });
    });

}


exports.login = async(req, res) => {

    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please insert email and password'
            })
        }

        var sql = "SELECT * FROM user WHERE email = ?"; // Prepare SQL

        db.query(sql, [email], function(err, result) {
            console.log(result);

            if (!result || !(bcrypt.compare(password, result[0].password))) {
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect'
                })
            } else {
                const id = result[0].ID;
                const login = result[0].name;
                var all_users_array = [];

                // set token
                const token = jwt.sign({ id: id }, 'my_secret_key', {
                    expiresIn: 86400 // 24h
                });

                // set coockie
                const coockieOptions = {
                        expires: new Date(
                            Date.now() + 90 * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }
                    // writed coockie values
                res.cookie('jwt', token, coockieOptions);
                res.cookie('login', login, "");
                res.cookie('id', id, "");

                var SQL_all_users = "SELECT * FROM user"; // Prepare SQL

                db.query(SQL_all_users, "", function(err, result) {
                    if (result.length != 0) {

                        for (var i = 0; i < result.length; i++) {
                            all_users_array.push(result[i].name);
                        }


                    } else {
                        console.log(err);
                    }
                });

                const options = {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                }

                var date = new Date();
                var CurrentDate = Intl.DateTimeFormat('it-IT', options).format(date)

                return res.status(200).render('user', {
                    message: 'Welcome ' + login + ' Your control ID: ' + id,
                    users: all_users_array,
                    logingTime: CurrentDate.toString()

                });


            }


        });

    } catch (error) {
        console.error();
    }
}

exports.user = async(req, res) => {
    try {
        const { email, OldPassword, NewPassword } = req.body;

        if (email == "" || OldPassword == "" || NewPassword == "") {
            res.status(401).render('user', {
                errorMessage: 'Fields are mandatory'
            });
        }

        db.query("SELECT * FROM user WHERE email = ?", [email], async function(err, result) {

            if (!result || !(bcrypt.compare(OldPassword, result[0].password))) {
                console.log()
            } else {
                let hashNewPassword = await bcrypt.hash(NewPassword, 8);
                let login = result[0].name;

                let UpdateSQL = "UPDATE user SET password = ? WHERE email = ?";

                db.query(UpdateSQL, [hashNewPassword, email], function(err, result) {
                    if (result != null) {


                        var SQL_all_users = "SELECT * FROM `user`"; // Prepare SQL

                        db.query(SQL_all_users, "", function(err, result) {
                            if (result.length != 0) {

                                for (var i = 0; i < result.length; i++) {
                                    all_users_array.push(result[i].name);
                                }


                            } else {
                                console.log(err);
                            }
                        });

                        const options = {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric'
                        }

                        var date = new Date();
                        var CurrentDate = Intl.DateTimeFormat('it-IT', options).format(date)

                        return res.status(200).render('user', {
                            message: 'Welcome ' + login + ' Your control ID: ' + id,
                            users: all_users_array,
                            logingTime: CurrentDate.toString(),
                            confirmMessage: 'You have successfully changed your password.'


                        });
                    }

                });


            }
        });


    } catch (error) {
        console.error()
    }
}