$('.ui.dropdown').dropdown();
var uploads = "";
document.getElementById("file-input").onchange = function () {
    const input = document.getElementById('file-input');
    const fd = new FormData();
    for (var i = 0; i < input.files.length; i++)
        fd.append('files', input.files[i]);
    fetch('/uploadfile', {
        method: 'POST',
        body: fd
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (uploads == "") {
                uploads += data.result[0];
                for (let i = 1; i < data.result.length; i++)
                    uploads += "," + data.result[i];
            }
            else {
                for (let i = 0; i < data.result.length; i++)
                    uploads += "," + data.result[i];
            }
            for (let i = 0; i < data.result.length; i++) {
                let url = "../uploads/" + data.result[i];
                var imgNode = "<img id ='preview' src='" + url + "'>";
                $('#show-img').append(imgNode);
                $('#show-img').append('<hl>');
            }
        })
        .catch(err => console.log(err));
};

function inputOn() {
    document.getElementById('file-input').click();
};

function submitPost() {
    var data = {
        text: $('#text').val(),
        uploads: uploads,
        categories: $('#category-select').val()
    }
    if (data.text == "" && data.uploads == "")
        return;

    fetch('http://localhost:3000/submitpost', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.json())
        .then((data) => {
        });
    alert('you shared a new post');
}
