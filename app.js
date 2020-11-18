const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const mysql = require('mysql');
const db = require('./db.config');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const server = app.listen(PORT, function () {
    console.log('Node server listening at http://localhost:' + PORT);
});

app.use(express.static('src/js'));
app.use(express.static('src'));
app.use(express.static('src/html'));
app.use('/assets', express.static('assets'));
app.use(express.static('src/ejs'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

//for multiple files uploading using multer
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(`${__dirname}/uploads`));
    },
    filename: function (req, file, callback) {
        callback(null, "up_" + Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({
    storage: storage
});
// ------------------------------------------------

// db connection
const conn = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.pass,
    database: db.database,
    multipleStatements: true
});

conn.connect(function (err) {
    if (err) throw err;
    console.log("connected to mysql database.");
});

// sql queries
var categories;
var sql = "select * from categories order by category_id desc";
conn.query(sql, function (err, result) {
    if (err)
        console.log(err);
    categories = result;
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

app.get('/u/dashboard', function (req, res) {
    if (req.cookies.userid == undefined)
        req.cookies.userid = 1;
    var sql1 = "select fc.category_id, name from follow_category fc join categories c on fc.category_id = c.category_id where fc.user_id = " + req.cookies.userid + ";"
    var sql2 = "select user_id, username from follow_people join user on follows_user_id = user_id where this_user_id = " + req.cookies.userid;
    console.log(sql1, "\n", sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);

        sql1 = "select * from post where created_by in (?) order by date desc;";
        sql2 = "select avatar,user_id from profile where user_id in (?)";

        var userid = [];
        for (var i = 0; i < result[1].length; i++)
            userid.push(result[1][i].user_id)
        values = [userid, userid];
        console.log(sql1, values[0], sql2, values[1]);
        conn.query(sql1 + sql2, values, function (err, result2) {
            if (err)
                console.log(err);
            console.log(result2);
            var post_ids = [];
            for (var i = 0; i < result2[0].length; i++)
                post_ids.push(result2[0][i].post_id);

            sql1 = "select * from likes where user_id = " + req.cookies.userid + " and post_id in (" + post_ids + ")";
            console.log(sql1);
            conn.query(sql1, function (err, result3) {
                if (err)
                    console.log(err);
                console.log("result3", result3);
                return res.render('dashboard.ejs', { categories: result[0], folPeoples: result[1], posts: result2[0], profile: result2[1], likedPost: result3 });
            });
        });
    });
});

app.get('/u/like/:post_id/:likes', function (req, res) {
    console.log(req.params.post_id, req.params.likes);
    var likes = parseInt(req.params.likes) + 1;
    var sql1 = "update post set likes = " + likes + " where post_id = " + req.params.post_id + ";";
    var sql2 = "insert into likes values(" + req.params.post_id + "," + req.cookies.userid + ")";
    console.log(sql1, sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(JSON.stringify({ "success": true }));
    })
});


app.get('/u/unlike/:post_id/:likes', function (req, res) {
    console.log(req.params.post_id, req.params.likes);
    var likes = parseInt(req.params.likes) - 1;
    var sql1 = "update post set likes = " + likes + " where post_id = " + req.params.post_id + ";";
    var sql2 = "delete from likes where post_id = " + req.params.post_id + " and user_id = " + req.cookies.userid;
    console.log(sql1, sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(JSON.stringify({ "success": true }));
    })
});

app.get('/u/addpost', function (req, res) {
    return res.render('post', { categories: categories });
});


app.get('/u/explore', function (req, res) {
    res.render('explore.ejs', { categories: categories });
});

app.get('/getcookie/:cookie', function (req, res) {
    console.log(req.params.cookie);

})
app.get('/uploads/:file', function (req, res) {
    console.log(req.params);
    res.sendFile(__dirname + '/uploads/' + req.params.file);
})


// post requests 
// ==============

app.post('/auth', function (req, res) {
    console.log(req.body);
    var sql = "select * from user where (username = ? or email = ?) and password = ?";
    var values = [mysql.escape(req.body.user), mysql.escape(req.body.user), mysql.escape(req.body.pass)];
    conn.query(sql, values, function (err, result) {
        if (err)
            throw err;
        console.log(result);
        if (result.length > 0) {
            res.cookie('userid', result[0].user_Id);
            return res.send(JSON.stringify({ message: "found" }));
        }
        else
            return res.send(JSON.stringify({ message: "not found" }));
    });
});

app.post('/create_user', function (req, res) {
    console.log(req.body);
    var sql = "Insert into user (email,username,password) values ?";
    var values = [[mysql.escape(req.body.email), mysql.escape(req.body.username), mysql.escape(req.body.password)]];
    conn.query(sql, [values], function (err, result) {
        if (err) {
            console.log(err);
            // duplicate entry error.
            if (err.errno === 1062)
                return res.send(JSON.stringify({ message: "failed", errno: 1062, sqlMessage: err.sqlMessage }));
        }
        res.cookie('userid', result.insertId);
        console.log("inserted user :", req.body.username);
        return res.send(JSON.stringify({ message: "success" }));
    });
});

app.post('/uploadfile', upload.array("files", 10), function (req, res) {
    console.log("uploading files.");
    let result = [];

    for (let i = 0; i < req.files.length; i++) {
        result.push(req.files[i].filename);
    }
    console.log(result);
    return res.send(JSON.stringify({ message: 'success', result: result }));
});

app.post('/submitpost', function (req, res) {
    var date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    var sql = "insert into post (likes,no_comments,no_shares,date,text,uploads,created_by) values ?";
    if (req.cookies.userid == undefined)
        req.cookies.userid = 1;
    var values = [[0, 0, 0, date, mysql.escape(req.body.text), req.body.uploads, req.cookies.userid]];
    conn.query(sql, [values], function (err, result) {
        if (err)
            console.log(err);
        var id = result.insertId;
        var categories = req.body.categories;
        sql = "insert into post_category values ?";
        values = [];
        for (var i = 0; i < categories.length; i++) {
            values.push([parseInt(categories[i]), id]);
        }
        conn.query(sql, [values], function (err, result) {
            if (err)
                console.log(err);
        });
    });
    return res.send(JSON.stringify({ message: "success" }));
});
