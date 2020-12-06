
var userid = undefined;
fetch('http://localhost:3000/getcookie/userid')
    .then((response) => response.json())
    .then((data) => userid = data.cookie);

var to_userid = undefined;
var to_userid = document.getElementById('userid').innerHTML;
function getMyMessage(msg) {
    var date = new Date();
    var min = date.getMinutes();
    if (min < 10)
        min = "0" + min;
    var str = "<div class='my-message text-break mb-0 m-3 ml-auto' >" + msg + '</div>';
    str += "<div class='my-time ml-auto mr-3' >" + date.getHours() + " : " + min + "</div>";
    return str;
}

function submitMessage() {
    to_userid = document.getElementById('userid').innerHTML;
    var msg = document.getElementById('msg-input').value;
    if (msg.length == 0)
        return;
    var data = { to: to_userid, msgText: msg };
    fetch('http://localhost:3000/sendmessage', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => response.json())
        .then((resjson) => {
            if (resjson.success == true) {
                $('.his-time').remove();
                $('.my-time').remove();
                document.getElementById('scroll-end').remove();
                $('.msg-list').append(getMyMessage(data.msgText));
                $('.msg-list').append("<div id='scroll-end'></div>");
                document.getElementById('scroll-end').scrollIntoView(false);
                msgListLen += 1;
                document.getElementById('msg-input').value = "";
            }
        });
}

function newMessage(msg) {
    if (msg.sender_id == userid)
        return "<div class='my-message text-break mb-0 m-3 ml-auto'>" + msg.msgText + "</div>"
    else
        return "<div class='his-message text-break mb-0 m-3'>" + msg.msgText + "</div>"
}

var msgListLen = document.getElementById('msg-list-len').innerHTML;
function refreshMessages() {
    clearTimeout(timer);
    to_userid = document.getElementById('userid').innerHTML;
    fetch('http://localhost:3000/refreshmessages/' + to_userid)
        .then((response) => response.json())
        .then((data) => {
            var diff = data.msglist.length - msgListLen;
            msgListLen = data.msglist.length;
            if (diff > 0) {
                document.getElementById('scroll-end').remove();
                $('.his-time').remove();
                $('.my-time').remove();
                for (var i = 0; i < diff; i++) {
                    if (data.msglist[i].sender_id == userid)
                        $('.msg-list').append("<div class='my-message text-break mb-0 m-3 ml-auto'>" + data.msglist[i].msg_text.slice(1, -1) + "</div>");
                    else
                        $('.msg-list').append("<div class='his-message text-break mb-0 m-3'>" + data.msglist[i].msg_text.slice(1, -1) + "</div>");
                }
                if (data.msglist[diff - 1].sender_id == userid)
                    $('.msg-list').append("<div class='my-time ml-auto mr-3'>" + getDate(data.msglist[diff - 1].time) + "</div>");
                else
                    $('.msg-list').append("<div class='his-time ml-3'>" + getDate(data.msglist[diff - 1].time) + "</div>");
                $('.msg-list').append("<div id='scroll-end'></div>");
                document.getElementById('scroll-end').scrollIntoView(false);
            }
        });
    var timer = setTimeout(refreshMessages, 5000);
}

function getDate(date) {
    return new Date(date).toString().slice(16, 21).replace(":", " : ");
}

document.getElementById('scroll-end').scrollIntoView(false);
refreshMessages();

function gotoUserMessages(id) {
    $.get('/getmessages/' + id, function (html) {
        $('#part-message').html(html);
    });
}

function getSuggestComponent(userlist) {
    var component = "";
    if (userlist.length == 0)
        component += "<div class='suggest-item p-2'>Not Found</div>";
    for (var i = 0; i < userlist.length; i++) {
        if (i != 0)
            component += "<div class='dropdown-divider'></div>";
        component += "<div class='suggest-item p-2' onclick=gotoUserMessages(" + userlist[i].user_id + ")>";
        if (userlist[i].avatar == null)
            component += "<i class='fas fa-user-circle fa-lg mr-3'></i>";
        else
            component += "<img  class='rounded-circle z-depth-0 mr-3' height='35' scr='../uploads'" + userlist[i].avatar + ">";
        component += userlist[i].username.slice(1, -1);
        component += "</div>"
    }
    return component;
}

function search(this_el) {
    if (this_el.value.length == 0) {
        $('#messenger-layout .suggest-item').remove();
        $('#messenger-layout .dropdown-divider').remove();
        $('#messenger-layout .suggest').append("<div class='suggest-item p-2'>Not Found</div>");
        return;
    }
    fetch("http://localhost:3000/search/" + this_el.value)
        .then((response) => response.json())
        .then((resjson) => {
            $('#messenger-layout .suggest-item').remove();
            $('#messenger-layout .dropdown-divider').remove();
            $('#messenger-layout .suggest').append(getSuggestComponent(resjson.userlist));
        });
}

function showHideSuggest() {
    $('#messenger-layout .suggest').toggle("slow", "linear");
}
