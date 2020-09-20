
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    options.async = true;
});

$(document).ready(function () {
    $('#nav-holder').load('nav.html');
    $('#content').load('dashboard.html');
});
