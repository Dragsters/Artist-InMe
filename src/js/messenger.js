// var userid = undefined;
// fetch('http://localhost:3000/getcookie/userid')
//     .then((response) => response.json())
//     .then((data) => userid = data.cookie);

var to_userid = undefined;

function search() {

}

function placeUser(this_el) {

}

function submitMessage() {
    var msg = document.getElementById('msg-input').value;
    var data = { to: to_userid, msgBody: msg }
    fetch('http://localhost:3000/sendmessage', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => response.json())
        .then((data) => { console.log(data); })
}

function gotoUserMessages() {

}