var activeclass = document.querySelectorAll('#nav-two .tab');

for (var i = 0; i < activeclass.length; i++) {
    activeclass[i].addEventListener('click', activateClass);
}

function activateClass(e) {
    for (var i = 0; i < activeclass.length; i++)
        activeclass[i].classList.remove('active');
    var element = e.target;
    while (element && element.parentNode) {
        element = element.parentNode;
        if (element.tagName == "DIV") {
            element.classList.add('active');
            break;
        }
    }
}

function dashboard() {
    $('#content').load('dashboard.html');
}
function addPost() {
    $('#content').load('addpost.html');
}
function explore() {
    $('#content').load('explore.html');
}
function messenger() {
    $('#content').load('messenger.html');
}
function shop() {
    $('#content').load('shop.html');
}
function profile() {
    $('#content').load('profile.html');
}

