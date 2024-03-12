const animationDiv = document.getElementById('loading-animation');

const date = new Date();
const xhr = new XMLHttpRequest();
xhr.open("GET", "/api/schedule?offset=" + (-date.getTimezoneOffset()));
xhr.send();
var gotResponse = false;

xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
        gotResponse = true;
        animationDiv.style.display = 'none';
        document.getElementById('schedule-div').innerHTML = xhr.response;
        document.getElementById('schedule-div').style.display = 'block';
    }
};

setTimeout(function() {
    if (!gotResponse) {
        animationDiv.style.display = 'block';
    }
}, 100);
