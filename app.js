var express = require('express');
var app = express();
var path = require('path');
var server = app.listen(3000, function () {
    console.log('Node server listening at 3000');
});

app.use(express.static('src/js'));
app.use(express.static('src'));
app.use(express.static('src/html'));
app.use('/assets',express.static('assets'))

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

app.get('/u', function (req, res) {
    res.sendFile('src/html/main.html', { root: __dirname });
})

// app.get('/u/nav.html', function (req, res) {
//     res.sendFile('src/html/nav.html', { root: __dirname });
// });

