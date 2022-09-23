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
const filterInputs = filterForm.querySelectorAll('input');
const resetFilterButton = filterForm.querySelector('.reset-filter');

resetFilterButton.addEventListener('click', e => {
    e.preventDefault();

    resetFilter();
});

filterForm.addEventListener('change', () => {
    let filters = createFilters();
    console.log(filters);

    friendList = filterFriendList(filters);
    console.log(friendList);
});

function resetFilter() {
    const defaultFilterValues = ['both', 'none1', 'none2'];

    filterInputs.forEach(item => {
        item.checked = false;
        if(defaultFilterValues.indexOf(item.id) >= 0) item.checked = true;
    });
}

function createFilters() {
    return [...filterInputs.values()].reduce((params, item) => {
        if(
            item.checked &&
            item.value !== '-1'
        ) {
            params.push(item.value);
        }

        return params;
    }, []);
}

function filterFriendList(filters) {
    friendList = defaultFriendList.slice();

    if(filters.length === 1) {
        return friendList.filter(friend => filters[0] === 'both' || friend.gender === filters[0]);
    }

    if(filters[0] === 'both' && typeof +filters[1] === 'number' && +filters[1]) {
        console.log(1);
            // variable next need for to keep order
            let next = 0;
            const gender = (!+filters[1]) ? 'female' : 'male';
            return friendList.reduce((friends, person) => {
                if(person.gender === gender) {
                    friends = [...friends.slice(0, next), person, ...friends.slice(next)];
                    next += 1;
                }else {
                    friends.push(person);
                }
                return friends;
            }, []);

    }else {
        friendList = friendList.filter(friend => filters[0] === 'both' || friend.gender === filters[0]);
        if(typeof +filters[1] === 'number' && +filters[1]) {
            return (!+filters[1]) ? friendList : friendList.reverse();
        }


        if(filters[1] === 'age') {
            friendList.sort((friend1, friend2) => {
                return (!+filters[2] || !filters[2]) ? friend1.dob.age - friend2.dob.age : friend2.dob.age - friend1.dob.age;
            });
        }

        return friendList;

        // friendList.reduce((friends, person) => {

        // }, []);
    }
    //console.log(filters);
}
