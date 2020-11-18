$('.carousel').carousel({
    interval: 2000
});

function gotoAddPost() {
    document.getElementById('nav-addpost-btn').click();
}

function like(post_id) {
    var likes = parseInt($('#no-likes').html());
    console.log(likes);
    var like_i = document.getElementById('like-i');
    if (like_i.classList.contains("liked")) {
        console.log(true);
        like_i.classList.remove("liked");
        like_i.classList.add("unliked")
        $('#like-i').replaceWith("<i id='like-i' class='material-icons md-24 unliked'>favorite_border</i>");

        fetch('http://localhost:3000/u/unlike/' + post_id + '/' + likes)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.success == true) { }
            });
        likes = likes - 1;
        document.getElementById('no-likes').innerHTML = ("" + likes);
    } else {
        console.log(false);
        like_i.classList.remove("unliked");
        like_i.classList.add("liked");
        $('#like-i').replaceWith("<i id='like-i' class='material-icons md-24 liked'>favorite</i>");
        fetch('http://localhost:3000/u/like/' + post_id + '/' + likes)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.success == true) { }
            });
        likes = likes + 1
        document.getElementById('no-likes').innerHTML = ("" + likes);
    }

}
function comment() { }
function share() { }
function gotoCategory() { }
function gotoUser() { }
function gotoNotif() { }
function gotoMessage() { }
