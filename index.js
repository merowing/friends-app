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
        console.log(error);
        error.then(data => console.log(data));
    });
}

function createFriendCard() {
    console.log(JSON.stringify(friendList));
    const friendListBlock = document.querySelector('.friendlist > ul');
    friendListBlock.innerHTML = "";

    let fragmentFriendslist = document.createDocumentFragment();
    friendList.forEach(friend => {
        const temp = [
            friend.id,
            friend.gender,
            friend.picture.large,
            friend.name.title,
            friend.name.fullname,
            friend.country,
            friend.dob.fulldate,
        ];

        const template = friendCardTempalte(temp);
        fragmentFriendslist.appendChild(template);
    });

    friendListBlock.appendChild(fragmentFriendslist);
}

function paginationTemplate() {
    
}

function friendCardTempalte(friends) {
    const [id, gender, img, title, name, country, birth] = friends;

    const template = document.createElement('li');
    template.innerHTML = `
                        <div class="friendcard">
                            <img src="${img}" alt="${name}">
                            <ul>
                                <li class="friendcard-title">${title}</li>
                                <li class="friendcard-name">${name}</li>
                                <li class="friendcard-from">from: ${country}</li>
                                <li class="friendcard-birth">${birth}</li>
                            </ul>
                            <div class="friendcard-id">${(id + 1)}</div>
                            <div class="friendcard-gender"></div>
                        </div>
                    </li>
                    `;
    return template;
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
        if(item.getAttribute("type") === "text") item.value = "";

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
        if(!filters[2]) return friendList;

        if(filters[1] === 'age') {
            friendList.sort((friend1, friend2) => {
                return (!+filters[2]) ? friend1.dob.age - friend2.dob.age : friend2.dob.age - friend1.dob.age;
            });
        }

        if(filters[1] === 'name') {
            friendList.sort((friend1, friend2) => {

                let name1 = friend1.name.fullname;
                let name2 = friend2.name.fullname;

                let n = 0;
                while(name1.slice(0, n) === name2.slice(0, n)) {
                    n += 1;
                }

                name1 = name1.slice(0, n);
                name2 = name2.slice(0, n);

                const condition = (!+filters[2]) ? name1 > name2 : name2 > name1;

                return condition ? 1 : -1;            
            });
        }

        return friendList;
    }
}

const search = document.querySelector(".search");
const searchClear = document.querySelector(".search-clear");

let searchTimer;
search.addEventListener("keyup", () => {
    clearInterval(searchTimer);
    searchClear.classList.add('visible');

    searchTimer = setTimeout(() => {
        friendList = searchFriend(search.value.toLowerCase());
        
        console.log(friendList);
    }, 300);
});

searchClear.addEventListener("click", () => {
    clearInterval(searchTimer);
    search.value = "";
    searchClear.classList.remove("visible");
});

function searchFriend(str) {
    return friendList.filter(friend => friend.name.fullname.toLowerCase().indexOf(str) >= 0);
}
