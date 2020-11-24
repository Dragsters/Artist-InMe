
$('.carousel').carousel({
    interval: 2500
});

var userid = undefined;
var username = undefined;
fetch('http://localhost:3000/getcookie/userid')
    .then((response) => response.json())
    .then((data) => {
        userid = data.cookie;
        fetch('http://localhost:3000/get/username/' + userid)
            .then((response) => response.json())
            .then((data) => {
                username = data.username.slice(1, -1);
            });
    });

function gotoAddPost() {
    document.getElementById('nav-addpost-btn').click();
}

function like(post_id) {
    var likes = parseInt($('#no-likes').html());
    var like_i = document.getElementById('like-i');
    if (like_i.classList.contains("liked")) {
        like_i.classList.remove("liked");
        like_i.classList.add("unliked")
        $('#like-i').replaceWith("<i id='like-i' class='material-icons md-24 unliked'>favorite_border</i>");

        fetch('http://localhost:3000/u/unlike/' + post_id)
            .then((response) => response.json())
            .then((data) => {
                if (data.success == true) { }
            });
        likes = likes - 1;
        document.getElementById('no-likes').innerHTML = ("" + likes);
    } else {
        like_i.classList.remove("unliked");
        like_i.classList.add("liked");
        $('#like-i').replaceWith("<i id='like-i' class='material-icons md-24 liked'>favorite</i>");
        fetch('http://localhost:3000/u/like/' + post_id)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.success == true) { }
            });
        likes = likes + 1
        document.getElementById('no-likes').innerHTML = ("" + likes);
    }

}


function getCommentUi( username, commentText, date) {
    var commentui = "<div class='comment pl-4 p-2'>"
        + "<div class = 'row'>"
        + "<div class='username'>"
        + username
        + "</div></div>"
        + commentText
        + "</div>";
    return commentui;
}

var postcomments = [];
$('#comment-form').hide();

function comment(post_id, post_i) {
    var post = "#post-" + post_i + " .comment-list";
    var found = postcomments.find(function (post, index) {
        if (post.postno == post_i)
            return true;
    });
    $('#comment-form').toggle("fast", "linear");
    if (!found)
        fetch('http://localhost:3000/comments/' + post_id)
            .then((response) => response.json())
            .then((data) => {
                postcomments.push({ postno: post_i, comments: data });
                console.log(postcomments);
                console.log(data);
                var comment = getCommentUi( data[0].username.slice(1, -1), data[0].comment_text.slice(1, -1), data[0].date);
                $(post).append(comment);
                if (data.length > 1) {
                    for (var i = 1; i < 3 && i < data.length; i++) {
                        comment = getCommentUi( data[i].username.slice(1, -1), data[i].comment_text.slice(1, -1), data[i].date);
                        $(post).append(comment);
                    }
                    $(post).append("<div class='more-cmnt-btn ml-4 m-3 mr-5' onclick='moreComments(" + post_i + "," + 6 + ")'>show more</div>");
                }
            });
    else
        $(post).toggle("fast", "linear");
}

function moreComments(post_i, end) {
    var postbox = postcomments.find(function (post, index) {
        if (post.postno === post_i)
            return true;
    });
    var post = "#post-" + post_i + " .comment-list";
    var morebtn = post + " .more-cmnt-btn";
    $(morebtn).hide();
    for (var i = end - 3; i < end && i < postbox.comments.length; i++) {
        var comment = getCommentUi(postbox.comments[i].avatar, postbox.comments[i].username.slice(1, -1), postbox.comments[i].comment_text.slice(1, -1), postbox.comments[i].date);
        $(post).append(comment);
    }
    var newend = end + 3;
    $(post).append("<div class='more-cmnt-btn ml-4 m-3 mr-5' onclick='moreComments(" + post_i + "," + newend + ")'>show more</div>");
}

function submitComment(post_id, post_i) {
    var input = "#post-" + post_i + " .comment-list input";
    var inputval = $(input).val();
    var no_comments = parseInt($('#no-comments').html());
    no_comments = no_comments + 1;
    var data = { userid: userid, commentText: inputval, postId: post_id };
    fetch('http://localhost:3000/addcomment', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success == true) {
                var comment = "#post-" + post_i + " .comment-list > div:nth-child(1)";
                var commentui = getCommentUi(username, inputval, "now")
                $(comment).after(commentui);
                document.getElementById('no-comments').innerHTML = ("" + no_comments);
            }
        });
}

function share(post_id) {
    var no_shares = parseInt($('#no-shares').html()) + 1;
    fetch('http://localhost:3000/share/' + post_id + '/' + userid)
        .then((response) => response.json())
        .then((data) => {
            if (data.success == true) {

                document.getElementById('no-shares').innerHTML = ("" + no_shares);
            }
            alert(data.message);
        });
}

function gotoCategory() { }
function gotoUser() { }
function gotoNotif() { }
function gotoMessage() { }
