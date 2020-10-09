$(document).ready(function () {
    new WOW().init();
});
var textWrapper = document.querySelector('.label-button .text-animate');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({ loop: false })
    .add({
        targets: '.label-button .text-animate .letter',
        translateX: [40, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: (el, i) => 3000 + 50 * i
    });
    // for reversing the same animation.
    // }).add({
    //     targets: '.label-button .text-animate .letter',
    //     translateX: [0, -30],
    //     opacity: [1, 0],
    //     easing: "easeInExpo",
    //     duration: 1100,
    //     delay: (el, i) => 100 + 30 * i
    // });


