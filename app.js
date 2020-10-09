const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mysql = require('mysql');
const db = require('./db.config');


const server = app.listen(PORT, function () {
    console.log('Node server listening at http://localhost:' + PORT);
});

app.use(express.static('src/js'));
app.use(express.static('src'));
app.use(express.static('src/html'));
app.use('/assets', express.static('assets'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// db connection
const conn = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.pass,
    database: db.database
});

conn.connect(function (err) {
    if (err) throw err;
    console.log("connected to mysql database.");
});


// get requests
app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/u', function (req, res) {
    res.sendFile('src/html/main.html', { root: __dirname });
});

var signin = false
app.get('/signin', function (req, res) {
    signin = true;
    res.sendFile('src/html/signinup.html', { root: __dirname })
});

app.get('/signup', function (req, res) {
    signin = false;
    res.sendFile('src/html/signinup.html', { root: __dirname })
});

app.get('/signmode', function (req, res) {
    res.send(JSON.stringify({ signin: signin }))
});


// post requests 
app.post('/auth', function (req, res) {
    console.log(req.body);
    res.send(JSON.stringify({ message: "auth req reached." }));
});

app.post('/create_user', function (req, res) {
    console.log(req.body);
    var sql = "Insert into user (email,username,password) values ?";
    var values = [[mysql.escape(req.body.email), mysql.escape(req.body.username), mysql.escape(req.body.password)]];
    conn.query(sql, [values], function (err, result) {
        if (err) {
            res.send(JSON.stringify({ message: "failed" }));
            throw err;
        }
        console.log("inserted user :", req.body.username);
    });
    res.send(JSON.stringify({ message: "success" }));
});

