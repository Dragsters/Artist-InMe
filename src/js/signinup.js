var sign_in_up_form = document.getElementsByClassName("sign-in-up-form");
var signin_form = document.getElementsByClassName("signin-form-div");
var signup_form = document.getElementsByClassName("signup-form-div");
var btn_layer = document.getElementsByClassName("btn-layer");
var toggle_btn = document.getElementsByClassName("toggle-btn")
var btn_signin = toggle_btn[0];
var btn_signup = toggle_btn[1];

function signup() {
    sign_in_up_form[0].style.transform = "translateX(-50%)";
    signup_form[0].style.opacity = 1;
    signin_form[0].style.opacity = 0;
    btn_layer[0].style.left = "50%";
    btn_signup.style.color = "#0D131F"
    btn_signin.style.color = "white"
}

function signin() {
    sign_in_up_form[0].style.transform = "translateX(0%)";
    signup_form[0].style.opacity = 0;
    signin_form[0].style.opacity = 1;
    btn_layer[0].style.left = "0%";
    btn_signin.style.color = "#0D131F"
    btn_signup.style.color = "white"
}

function forgot() {
    alert('processing...');
}

var signInMode = false;
fetch('http://localhost:3000/signmode')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        signInMode = data.signin;
        if (signInMode === false)
            signup();
    });

$("#signin-form").submit(function (e) {
    e.preventDefault();
    var inputvals = $("#signin-form input").serializeArray();
    var data = { user: inputvals[0].value, pass: inputvals[1].value }
    fetch('http://localhost:3000/auth', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.message === 'found')
                location.href = '/u';
            else
                alert('Username or Password Incorrect');
        });
});

$("#signup-form").submit(function (e) {
    e.preventDefault();
    var inputvals = $('#signup-form input').serializeArray();
    
    var data = {
        email: inputvals[0].value,
        username: inputvals[1].value,
        password: inputvals[2].value
    }

    fetch('http://localhost:3000/create_user', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.errno === 1062) {
                var sqlMessage = data.sqlMessage;
                if (sqlMessage.includes('username'))
                    alert('username already exist');
                else alert('email already exist');
            }
            if(data.message === 'success')
                location.href = '/u';
        });
});

