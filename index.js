const results = 10;
const seed = 'abc';
let page = 1;

const friendsUrl = `https://randomuser.me/api/?results=${results}&seed=${seed}&page=${page}`;
const body = document.querySelector('body');

fetch(friendsUrl)
.then(response => response.json())
.then(data => {
    //body.innerText = JSON.stringify(data.results[0].picture.large);
    body.innerHTML = '<img src="' + data.results[0].picture.large + '">';
    body.innerHTML += '<img src="' + data.results[0].picture.medium + '">';
    body.innerHTML += '<img src="' + data.results[0].picture.thumbnail + '">';
});
