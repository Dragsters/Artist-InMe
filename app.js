
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, function () {
    console.log('Node server listening at ', PORT);
});

app.use(express.static('src/js'));
app.use(express.static('src'));
app.use(express.static('src/html'));
app.use('/assets', express.static('assets'))

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
})
