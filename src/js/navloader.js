$(document).ready(function () {
    $("#nav-holder").load("nav.html");
});

$.ajaxPrefilter(function( options, original_Options, jqXHR ) {
    options.async = true;
});