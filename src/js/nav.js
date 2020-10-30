const { response } = require("express");

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

function getContent(Url) {
    $('#content').load('loader.html');
    $.get('/u/' + Url, function (html) {
        $('#content').html(html);
    });
}

