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
// ================
app.get('/home', function (req, res) {
    res.cookie('home', 'true');
    return res.redirect('/');
});

function requireLogin(req, res, next) {
    if (req.cookies.userid) {
        next();
    } else {
        res.redirect('/');
    }
}

app.all("/u/*", requireLogin, function (req, res, next) {
    next();
});

app.get('/u', function (req, res) {
    if (req.cookies.userid)
        return res.sendFile('src/html/main.html', { root: __dirname });
    return res.redirect('/');
});

app.get('/aboutus', function (req, res) {
    res.sendFile('src/html/aboutus.html', { root: __dirname });
})

var signin = false
app.get('/signin', function (req, res) {
    signin = true;
    res.sendFile('src/html/signinup.html', { root: __dirname });
});

app.get('/signup', function (req, res) {
    signin = false;
    res.sendFile('src/html/signinup.html', { root: __dirname })
});

app.get('/signmode', function (req, res) {
    res.send(JSON.stringify({ signin: signin }))
});

app.get('/logout', function (req, res) {
    res.clearCookie('userid');
    res.send(JSON.stringify({ success: true }))
});

app.get('/u/dashboard', function (req, res) {
    var sql1 = "select fc.category_id, name from follow_category fc join categories c on fc.category_id = c.category_id where fc.user_id = " + req.cookies.userid + ";"
    var sql2 = "select user_id, username from follow_people join user on follows_user_id = user_id where this_user_id = " + req.cookies.userid;
    // console.log(sql1, "\n", sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        // console.log(result);
        if (result[1].length == 0)
            return res.render('dashboard.ejs', { categories: result[0], folPeoples: result[1], posts: [], profile: {}, likedPost: [] });
        var userid = [];
        for (var i = 0; i < result[1].length; i++)
            userid.push(result[1][i].user_id);

        sql1 = "select post.*,profile.username, profile.avatar from post, profile where created_by in (?) and post.created_by = profile.user_id  order by date desc;";
        values = [userid];
        // console.log(sql1, values[0], sql2, values[1]);
        conn.query(sql1, [values], function (err, result2) {
            if (err)
                console.log(err);
            // console.log(result2);
            var post_ids = [];
            for (var i = 0; i < result2.length; i++)
                post_ids.push(result2[i].post_id);

            sql1 = "select * from likes where user_id = " + req.cookies.userid + " and post_id in (" + post_ids + ")";
            // console.log(sql1);
            conn.query(sql1, function (err, result3) {
                if (err)
                    console.log(err);
                console.log("result3", result3);
                var message = {};
                getmessages(req, res)
                    .then((msgobj) => {
                        // console.log(msgobj);
                        return res.render('dashboard.ejs', { categories: result[0], folPeoples: result[1], posts: result2, likedPost: result3, contacts: msgobj.contacts,userid: req.cookies.userid });
                    });
            });
        });
    });
});

app.get('/u/like/:post_id', function (req, res) {
    var sql1 = "update post set likes = likes + 1 where post_id = " + req.params.post_id + ";";
    var sql2 = "insert into likes values(" + req.params.post_id + "," + req.cookies.userid + ")";
    console.log(sql1, sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(JSON.stringify({ "success": true }));
    });
});

app.get('/u/unlike/:post_id', function (req, res) {
    var sql1 = "update post set likes = likes - 1 where post_id = " + req.params.post_id + ";";
    var sql2 = "delete from likes where post_id = " + req.params.post_id + " and user_id = " + req.cookies.userid;
    console.log(sql1, sql2);
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(JSON.stringify({ "success": true }));
    })
});

app.get('/comments/:post_id', function (req, res) {
    var sql = "select username,comment_text,date from profile join comments on profile.user_id = comments.commented_by where post_id = " + req.params.post_id;
    console.log(sql);
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(result);
    });
});

app.get('/u/addpost', function (req, res) {
    var sql = "select * from profile where user_id =" + req.cookies.userid;
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.render('post.ejs', { categories: categories, profile: result[0] });
    });
});

app.get('/u/explore', function (req, res) {
    res.render('explore.ejs', { categories: categories });
});

app.get('/getcookie/:cookie', function (req, res) {
    var cookie = req.params.cookie;
    var value = req.cookies[cookie];
    if (cookie == 'home')
        res.clearCookie('home');
    return res.send(JSON.stringify({ cookie: value }))
});

app.get('/get/username/:userid', function (req, res) {
    var sql = "select username from user where user_id = " + req.params.userid;
    // console.log(sql);
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err);
        // console.log(result);
        return res.send(JSON.stringify({ username: result[0].username }));
    });
});

app.get('/uploads/:file', function (req, res) {
    res.sendFile(__dirname + '/uploads/' + req.params.file);
});

app.get('/share/:postId/:userId', function (req, res) {
    var date2 = new Date()
    var date = date2.toISOString().slice(0, 10) + " " + date2.toString().slice(16, 24);
    var sql1 = "insert into shared values ?;";
    var sql2 = "update post set no_shares = no_shares + 1 where created_by = " + req.params.userId;
    var values = [[date, req.params.postId, req.params.userId]];
    conn.query(sql1 + sql2, [values], function (err, result) {
        if (err) {
            if (err.errno == 1062)
                return res.send(JSON.stringify({ success: false, message: "You Can Share a Post Only Once" }));
            console.log(err);
        }
        console.log(result);
        return res.send(JSON.stringify({ success: true, message: "You Reshared a Post" }));
    });
});

function getdateMonth(time) {
    var date = new Date(time).toDateString().slice(0, 10);
    return date;
}

function getmessages(req, res) {
    return new Promise(function (resolve, reject) {
        var sql = "select messages.*,p1.username as sender_name,p1.avatar as sender_avatar, p2.username as receiver_name,p2.avatar as receiver_avatar from messages,profile p1, profile p2 where (sender_id = " + req.cookies.userid + " or reciever_id = " + req.cookies.userid + ") and sender_id = p1.user_id  and reciever_id = p2.user_id order by time desc";
        conn.query(sql, function (err, result) {
            if (err)
                console.log(err);
            // console.log("messages query ",result);
            var userlist = [];
            var contacts = [];
            for (var i = 0; i < result.length; i++) {
                if (result[i].sender_id != req.cookies.userid) {
                    if (!userlist.includes(result[i].sender_id)) {
                        userlist.push(result[i].sender_id);
                        var res2 = { ...result[i] };
                        res2.time = getdateMonth(res2.time);
                        contacts.push(res2);
                    }
                }
                if (result[i].reciever_id != req.cookies.userid) {
                    if (!userlist.includes(result[i].reciever_id)) {
                        userlist.push(result[i].reciever_id);
                        var res2 = { ...result[i] };
                        res2.time = getdateMonth(res2.time);
                        contacts.push(res2);
                    }
                }
            }
            // console.log("contacts", contacts);
            if (contacts.length < 1)
                resolve({ contacts: contacts, msg_list: [], profile: [], userid: req.cookies.userid });
            else resolve({ contacts: contacts, msg_list: result.reverse(), userid: req.cookies.userid });
        });
    });
}

app.get('/u/messenger', function (req, res) {
    return getmessages(req, res)
        .then((msgObj) => res.render('messenger.ejs', msgObj));
});

app.get('/refreshmessages/:to_userid', function (req, res) {
    if (req.params.to_userid == undefined)
        return res.send(JSON.stringify({ msglist: [], message: "no messages" }));
    var sql1 = "select * from messages where (sender_id = " + req.cookies.userid + " and reciever_id = " + req.params.to_userid + ") or (sender_id = " + req.params.to_userid + " and reciever_id = " + req.cookies.userid + ") order by time desc";
    conn.query(sql1, function (err, result) {
        if (err)
            console.log(err);
        return res.send(JSON.stringify({ msglist: result }));
    });
});

app.get('/getmessages/:to_userid', function (req, res) {
    if (req.params.to_userid == undefined)
        return res.render('part_msglist.ejs', { msg_list: [], firstuser: {}, userid: req.cookies.userid });
    var sql1 = "select * from messages where (sender_id = " + req.cookies.userid + " and reciever_id = " + req.params.to_userid + ") or (sender_id = " + req.params.to_userid + " and reciever_id = " + req.cookies.userid + ") order by time;";
    var sql2 = "select username, avatar,user_id from profile where user_id = " + req.params.to_userid;
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        return res.render('part_msglist.ejs', { msg_list: result[0], firstuser: result[1][0], userid: req.cookies.userid });
    });
});


app.get('/search/:uname', function (req, res) {
    var sql = "select avatar,username,user_id from profile where upper(username) like upper('%" + req.params.uname + "%')";
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        for (i = 0; i < result.length; i++)
            if (result[i].user_id == req.cookies.userid)
                result.splice(i, 1);
        return res.send(JSON.stringify({ userlist: result }));
    });
});

app.get('/u/profile', function (req, res) {
    var sql = "select * from profile where user_id = " + req.cookies.userid;
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.render('profile.ejs', { profile: result[0], thisUser: true, follow: true });
    });
});

app.get('/u/profile/:id', function (req, res) {
    var sql1 = "select * from profile where user_id = " + req.params.id + ";";
    var sql2 = "select follows_user_id from follow_people where this_user_id = " + req.cookies.userid + " and follows_user_id = " + req.params.id;
    conn.query(sql1 + sql2, function (err, result) {
        if (err)
            console.log(err);
        // console.log(result);
        var follow = false;
        if (result[1].length > 0)
            follow = true;
        return res.render('profile.ejs', { profile: result[0][0], thisUser: false, follow: follow });
    });
})

app.get('/posts/category/:categoryId', function (req, res) {
    var sql1 = "select * from post p, post_category pc, profile where p.post_id = pc.post_id and pc.category_id = " + req.params.categoryId + " and p.created_by = profile.user_Id";
    conn.query(sql1, function (err, result) {
        if (err)
            console.log(err);
        // console.log(result);
        var postid = [];
        for (var i = 0; i < result.length; i++)
            postid.push(result[i].post_id);
        var sql2 = "select * from likes where user_id = " + req.cookies.userid + " and post_id in (" + postid + ")";
        conn.query(sql2, function (err, result2) {
            return res.render('part_postlist.ejs', { posts: result, likedPost: result2 });
        });
    });
});

// post requests 
// ==============

app.post('/auth', function (req, res) {
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
        sql = "Insert into profile(user_id, username) values ?";
        values = [[result.insertId, mysql.escape(req.body.username)]];
        conn.query(sql, [values], function (err, result) {
            if (err)
                console.log(err);
            console.log("inserted user :", req.body.username);
            return res.send(JSON.stringify({ message: "success" }));

        })
    });
});

app.post('/uploadfile', upload.array("files", 10), function (req, res) {
    let result = [];

    for (let i = 0; i < req.files.length; i++) {
        result.push(req.files[i].filename);
    }
    console.log(result);
    return res.send(JSON.stringify({ message: 'success', result: result }));
});

app.post('/submitpost', function (req, res) {
    var date2 = new Date();
    var date = date2.toISOString().slice(0, 10) + " " + date2.toString().slice(16, 24);
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
    sql = 'alter table profile update no_posts = no_posts+1 where user_id = ' + req.cookies.userid;
    conn.query(sql, function (err, result) {
        if (err)
            console.log(err)
    });
    return res.send(JSON.stringify({ message: "success" }));
});

app.post('/addcomment', function (req, res) {
    var date2 = new Date();
    var date = date2.toISOString().slice(0, 10) + " " + date2.toString().slice(16, 24);
    var sql1 = "insert into comments values ?;";
    var sql2 = "update post set no_comments = no_comments+1 where post_id = " + req.body.postId;
    var values = [[mysql.escape(req.body.commentText), req.body.postId, req.body.userid, date]]
    conn.query(sql1 + sql2, [values], function (err, result) {
        if (err)
            console.log(err);
        console.log(result);
        return res.send(JSON.stringify({ success: true }));
    });
});

app.post('/sendmessage', function (req, res) {
    console.log(req.body);
    var date2 = new Date();
    var time = date2.toISOString().slice(0, 10) + " " + date2.toString().slice(16, 24);
    var sql = "insert into messages values ?";
    var values = [[mysql.escape(req.body.msgText), time, req.cookies.userid, req.body.to]];
    conn.query(sql, [values], function (err, res) {
        if (err)
            console.log(err);
        console.log(res);
    });
    res.send(JSON.stringify({ success: true }));
});