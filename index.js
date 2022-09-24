let defaultFriendList = [];
let friendList = [];

const search = document.querySelector(".search");
const searchClear = document.querySelector(".search-clear");
const friendsNotFoundBlock = document.querySelector('.friends-not-found');

const perpage = 5;
const pagination = document.querySelector('.pagination');
let paginationTabs;
let activePage = 0;
let activeGender = 'both';
let countries = [];

let searchTimer;

loadFriendsData();

function loadFriendsData() {
    const SEED = 'abc';
    const results = 20;
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

            if(countries.length === 0) countries.push(country);
            if(!countries.some(c => c === country)) countries.push(country);

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

        createPagination();
        createCountryFilter();
    })
    .catch(error => {
        console.log(error);
        error.then(data => console.log(data));
    });
}

function createFriendCard() {
    const friendListBlock = document.querySelector('.friendlist > ul');
    friendListBlock.innerHTML = "";

    let fragmentFriendslist = document.createDocumentFragment();
    friendList.forEach(friend => {
        const {id, gender, picture:{large}, name:{title, fullname}, country, dob:{fulldate, age}} = friend;
        const temp = [
            id,
            gender,
            large,
            title,
            fullname,
            country,
            fulldate,
            age,
        ];

        const template = friendCardTempalte(temp);
        fragmentFriendslist.appendChild(template);
    });

    friendListBlock.appendChild(fragmentFriendslist);

    if(!friendList.length) {
        friendsNotFoundBlock.classList.remove('hidden');
        friendListBlock.innerHTML = "";
    }else {
        friendsNotFoundBlock.classList.add('hidden');
    }
}

function createPagination() {
    pagination.innerHTML = "";
    
    let pagesCount = friendList.length / perpage;
    let pagesCountInt = parseInt(pagesCount);
    
    if(pagesCountInt * perpage < perpage) {
        pagesCount = 1;
    }
    if(pagesCount % 1 < 1 && (pagesCount % 1 !== 0 || pagesCount === 1)) {
        pagesCountInt += 1;
    }
    
    const tabs = paginationTemplate(pagesCountInt);
    pagination.appendChild(tabs);

    paginationTabs = pagination.querySelectorAll('li');

    friendList = filterFriendList(createFilters());
    friendList = friendList.slice(activePage * perpage, (activePage + 1) * perpage);
    
    createFriendCard();
}

function paginationTemplate(pages) {
    let pagesFragment = document.createDocumentFragment();

    for(let i = 0; i < pages; i++) {
        let elem = document.createElement('li');
        if(i === activePage) elem.classList.add('active');
        elem.innerText = i + 1;
        pagesFragment.appendChild(elem);
    }

    return pagesFragment;
}

function friendCardTempalte(friends) {
    const [id, gender, img, title, name, country, birth, age] = friends;

    const template = document.createElement('li');
    template.innerHTML = `
                        <div class="friendcard">
                            <img src="${img}" alt="${name}">
                            <ul>
                                <li class="friendcard-title">${title}</li>
                                <li class="friendcard-name">${name}</li>
                                <li class="friendcard-from">${country}</li>
                                <li class="friendcard-birth">${birth} (age ${age})</li>
                            </ul>
                            <div class="friendcard-id">${(id + 1)}</div>
                            <div class="friendcard-gender-${gender}"></div>
                        </div>
                    </li>
                    `;
    return template;
}

const filterForm = document.querySelector('#filter-form');
const filterInputs = filterForm.querySelectorAll('input');
const resetFilterButton = filterForm.querySelector('.reset-filter');
const countyBlock = filterForm.querySelector('select[name="country"]');
let searchPressed = false;

resetFilterButton.addEventListener('click', e => {
    e.preventDefault();

    resetFilter();
});

filterForm.addEventListener('change', () => {
    if(!searchPressed) {
        let filters = createFilters();

        friendList = filterFriendList(filters);

        if(activeGender !== filters[0]) {
            activePage = 0;
        }
        activeGender = filters[0];

        createPagination();
    }
    searchPressed = false;
});

function resetFilter() {
    const defaultFilterValues = ['both', 'none1', 'none2'];

    filterInputs.forEach(item => {
        if(item.getAttribute("type") === "text") item.value = "";

        item.checked = false;
        if(defaultFilterValues.indexOf(item.id) >= 0) item.checked = true;
    });

    friendList = defaultFriendList.slice();
    activePage = 0;
    activeGender = 'both';

    countyBlock.selectedIndex = 0;
    createPagination();
}

function createFilters() {
    const filters = [...filterInputs.values()].reduce((params, item) => {
        if(item.checked || item.type === 'text') {
            params.push(item.value);
        }

        return params;
    }, []);

    const searchValue = filters.splice(0, 1);

    const selectedCountry = countyBlock.value;

    return [...filters, selectedCountry, ...searchValue];
}

function filterFriendList(filters) {
    friendList = defaultFriendList.slice();

    /*
     * 0 - gender
     * 1 - type
     * 2 - asc, desc
     * 3 - country
     * 4 - search value
    */

    filters.forEach((filter, index) => {
        if(index === 0) {
            friendList = friendList.filter(friend => filter === 'both' || friend.gender === filter);
        }

        if(index === 1 && !isNaN(+filters[2]) && +filters[1] !== -1 && +filters[2] !== -1) {
            if(filter === 'age') {
                friendList.sort((friend1, friend2) => {
                    return (!+filters[2]) ? friend1.dob.age - friend2.dob.age : friend2.dob.age - friend1.dob.age;
                });
            }

            if(filter === 'name') {
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
        }

        if(index === 2 && !isNaN(+filters[2]) && +filters[1] === -1 && +filters[2] !== -1) {
            
            if(filters[0] === 'both') {
                // variable next need for to keep order
                let next = 0;
                const gender = (!+filters[2]) ? 'female' : 'male';
                friendList = friendList.reduce((friends, person) => {
                    if(person.gender === gender) {
                        friends = [...friends.slice(0, next), person, ...friends.slice(next)];
                        next += 1;
                    }else {
                        friends.push(person);
                    }
                    return friends;
                }, []);
            }else {
                friendList = (+filters[2] && +filters[2] !== -1) ? friendList.reverse() : friendList;
            }

        }

        if(index === 3 && parseInt(filter) !== -1) {
            friendList = friendList.filter(friend => friend.country.toLowerCase() === filter.toLowerCase());
        }

        if(index === 4 && filter !== '') {
            friendList = friendList.filter(friend => friend.name.fullname.toLowerCase().indexOf(filter) >= 0);
        }
    });

    return friendList;
}

search.addEventListener("keyup", (e) => {
    clearInterval(searchTimer);
    searchPressed = true;

    if(search.value !== "") {
        searchClear.classList.add('visible');
    }else {
        clearSearch();
    }

    searchTimer = setTimeout(() => {
        friendList = filterFriendList(createFilters());

        createPagination();
        clearInterval(searchTimer);
    }, 100);

});

searchClear.addEventListener("click", () => {
    clearSearch();
});

function clearSearch() {
    clearInterval(searchTimer);
    search.value = "";
    searchClear.classList.remove("visible");
    searchPressed = false;
;
    friendList = defaultFriendList.slice();

    friendList = filterFriendList(createFilters());
    createPagination();
}

pagination.addEventListener("click", e => {
    const page = [...paginationTabs].indexOf(e.target);

    if(!paginationTabs[page].classList.contains('active')) {
        paginationTabs.forEach(item => {
            item.classList.remove('active');
        });
    }

    paginationTabs[page].classList.add('active');
    activePage = page;

    friendList = filterFriendList(createFilters());
    friendList = friendList.splice(perpage * page, perpage);
    
    createFriendCard();
});

function createCountryFilter() {
    const countryOptionElement = document.createDocumentFragment();

    countries.sort();
    countries.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.innerText = item;
        countryOptionElement.appendChild(option);
    });
    
    countyBlock.appendChild(countryOptionElement);
}
