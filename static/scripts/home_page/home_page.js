const animationDiv = document.getElementById('loading-animation');

const date = new Date();
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/schedule')
xhr.send();

var gotResponse = false;

function createElement(type, className, innerText) {
    const element = document.createElement(type);
    element.className = className;
    if (innerText != null) {
        element.innerText = innerText;
    }
    return element;
}

function getPlatformLink(platform) {
    if (platform == 'codeforces') {
        return 'https://codeforces.com';
    } else if (platform == 'atcoder') {
        return 'https://atcoder.jp';
    }
    return '';
}

function formatDate(date) {
    const MONTHS = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
    const DAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return String(date.getDate()) + ' ' + MONTHS[date.getMonth()] + ' (' + DAYS[date.getDay()] + ')';
}

function formatContestEvent(date) {
    return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
}

function formatContestDuration(duration) {
    duration = Math.floor(duration / 60)
    if (duration < 24 * 60) {
        return String(Math.floor(duration / 60)) + ":" + String(duration % 60).padStart(2, '0')
    }
    return String(Math.floor(duration / (60 * 24))) + ":"
         + String(Math.floor(duration / 60) % 24).padStart(2, '0') + ":"
         + String(duration % 60).padStart(2, '0');
}

function processContests(title, root, contests) {
    root.appendChild(createElement('div', 'day-div', title));

    const tableDiv = createElement('div', 'contests-table-div', '');
    tableDiv.appendChild(createElement('a', 'contests-title', 'Контесты'));
    root.appendChild(tableDiv);

    const table = document.createElement('table');
    tableDiv.appendChild(table);

    const COLUMNS_CLASSES = ['col-0', 'col-1', 'col-2', 'col-3', 'col-4', 'col-5'];
    const COLUMNS_NAMES = ['Платформа', 'Дата', 'Название', 'Начало', 'Конец', 'Длит.'];
    const header = document.createElement('tr');
    for (let i = 0; i < COLUMNS_CLASSES.length; i++) {
        header.appendChild(createElement('th', COLUMNS_CLASSES[i], COLUMNS_NAMES[i]));
    }
    table.appendChild(header);

    contests.forEach(contest => {
        const logo = createElement('img', 'logo-png');
        logo.src = '/images/' + contest.platform + '_logo.png';

        const logoLink = document.createElement('a');
        logoLink.href = getPlatformLink(contest.platform);
        logoLink.target = '_blank';
        logoLink.appendChild(logo);

        const firstCol = createElement('td', COLUMNS_CLASSES[0]);
        firstCol.appendChild(logoLink);
        
        const row = document.createElement('tr');
        row.append(firstCol);

        const date = new Date(contest.start * 1000)
        const cols = ['',
                      formatDate(date),
                      contest.title,
                      formatContestEvent(date),
                      formatContestEvent(new Date((contest.start + contest.duration) * 1000)),
                      formatContestDuration(contest.duration)];

        for (let i = 1; i < COLUMNS_CLASSES.length; i++) {
            row.appendChild(createElement('td', COLUMNS_CLASSES[i], cols[i]));
        }
        table.appendChild(row);
    });
}

xhr.onload = () => {
    if (xhr.readyState != 4 || xhr.status != 200) {
        return
    }

    gotResponse = true;
    animationDiv.style.display = 'none';

    const rootDiv = document.getElementById('schedule-div');

    const contests = JSON.parse(xhr.response)['contests'];
    contests.sort((a, b) => {
        return a['start'] - b['start'];
    });

    const runningContests = [];
    const upcomingContests = [];
    const now = Date.now();

    contests.forEach(contest => {
        if (contest['start'] + contest['duration'] > now) {
            runningContests.push(contest);
        } else {
            upcomingContests.push(contest);
        }
    });

    if (runningContests.length > 0) {
        processContests('Текущие', rootDiv, runningContests);
    }
    if (upcomingContests.length > 0) {
        processContests('Предстоящие', rootDiv, upcomingContests);
    }

    rootDiv.style.display = 'block';
};

setTimeout(function() {
    if (!gotResponse) {
        animationDiv.style.display = 'block';
    }
}, 100);
