let defaultFriendList = [];
let friendList = [];

loadFriendsData();

function loadFriendsData() {
    const SEED = 'abc';
    const results = 10;
    const listOfMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const url = `https://randomuser.me/api/?results=${results}&seed=${SEED}&exc=login,id`;
    
    fetch(url)
    .then(response => {
        if(!response.ok) return Promise.reject(response.text());

        return response.json();
    })
    .then(data => {
        defaultFriendList = data.results.reduce((allValues, currValue, id) => {
            const { gender, name:{title, first, last}, location:{country}, email, dob:{date, age}, picture, registered:{date:registeregDate} } = currValue;

            const [year, month, day] = date.split('T')[0].match(/[0-9]{2,4}/g);
            const fulldate = `${day} ${listOfMonth[+month - 1]} ${year}`;
            const fullname = first + ' ' + last;
            const [yearReg, monthReg, dayReg] = registeregDate.split('T')[0].split('-');
            const fullRegDate = dayReg + '.' + monthReg + '.' + yearReg;

            allValues.push({
                id,
                gender,
                name: {title, fullname},
                country,
                email,
                dob: {fulldate, age},
                registered: {fullregistered: fullRegDate, year: yearReg, month: monthReg, day: dayReg},
                picture,
            });
            
            return allValues;
        }, []);

        friendList = defaultFriendList.slice();

        createFriendCard();
    })
    .catch(error => {
        error.then(data => console.log(data));
    });
}

function createFriendCard() {
    console.log(JSON.stringify(friendList));
}

function paginationTemplate() {
    
}

function friendCardTempalte() {

}

const filterForm = document.querySelector('#filter-form');
const resetFilterButton = filterForm.querySelector('.reset-filter');

resetFilterButton.addEventListener('click', e => {
    e.preventDefault();

    resetForm();
});

function resetForm() {
    const defaultFilterValues = ['both', 'none1', 'none2'];
    const inputs = filterForm.querySelectorAll('input');

    inputs.forEach(item => {
        item.checked = false;
        if(defaultFilterValues.indexOf(item.id) >= 0) item.checked = true;
    });
}
