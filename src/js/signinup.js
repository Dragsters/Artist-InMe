
// var x = document.getElementById("signin");
// var y = document.getElementById("signup");
var z = document.getElementsByClassName("btn-layer");
function signup() {
    // x.style.left = "-400px";
    // y.style.left = "50px";
    z[0].style.left = "50%";
}

function signin() {
    // x.style.left = "50px";
    // y.style.left = "450px";
    z[0].style.left = "0%";
}

var signInMode = false;
fetch('http://localhost:3000/signmode')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        signInMode = data.signin;
        console.log("sign mode", signInMode);
        if (signInMode === false)
            signup();
    });

