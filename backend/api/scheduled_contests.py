from library.atcoder    import tryParseScheduledContests as tryParseScheduledContestsAtcoder
from library.atcoder    import ATCODER_MAIN_PAGE
from library.base       import Contest, shiftContestBy
from library.codeforces import getScheduledContestsList as tryParseScheduledContestsCodeforces
from library.codeforces import CODEFORCES_MAIN_PAGE
from library.utils.html import HtmlBuilder, BaseHtmlItem
from library.utils.time import floorDateToTheNearestDay, getCurrentDateTime

from flask import render_template
import datetime
import time

RETRYING_LOAD_CONTEST_DELAY = 30 # seconds
lastLoadRetry = None
parsedContests: dict[str, list[Contest]] = {}

def updateParsedContestsForPlatform(platform: str, platformParsedContests: list[Contest]):
    global parsedContests
    if platformParsedContests is None:
        return
    parsedContests[platform] = platformParsedContests

def updateParsedContests():
    global lastLoadRetry
    if lastLoadRetry is not None and time.time() - lastLoadRetry < RETRYING_LOAD_CONTEST_DELAY:
        return
    lastLoadRetry = time.time() 
    updateParsedContestsForPlatform('atcoder', tryParseScheduledContestsAtcoder())
    updateParsedContestsForPlatform('codeforces', tryParseScheduledContestsCodeforces())

def getScheduledContests() -> list[Contest]:
    updateParsedContests()
    mergedContests = []
    for platform, contests in parsedContests.items():
        mergedContests += contests
    return mergedContests

def formatContestDuration(duration) -> str:
    if duration is None:
        return ''
    duration //= 60
    if duration // 60 <= 24:
        return f'{duration // 60}:{str(duration % 60).zfill(2)}'
    return f'{duration // (60 * 24)}:{str(duration // 60 % 24).zfill(2)}:{str(duration % 60).zfill(2)}'

def formatDay(date: datetime.datetime) -> str:
    MONTHS = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
    DAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье']
    return f'{date.day} {MONTHS[date.month - 1]} ({DAYS[date.weekday()]})'

def formatContestEvent(data: datetime.datetime) -> str:
    if data is None:
        return ''
    return f'{data.hour}:{str(data.minute).zfill(2)}'

def getPlatformLink(platform: str) -> str:
    if platform == 'codeforces':
        return CODEFORCES_MAIN_PAGE
    if platform == 'atcoder':
        return ATCODER_MAIN_PAGE
    return ''

def considerContestsListHtml(rootHtml: HtmlBuilder, contests: list[Contest], title: str):
    if len(contests) == 0:
        return

    rootHtml.addEdge(BaseHtmlItem('div'), className='day-div').innerHtml = title
    tableDiv = rootHtml.addEdge(BaseHtmlItem('div'), className='contests-table-div')
    tableDiv.addEdge(BaseHtmlItem('a'), className='contests-title').innerHtml = 'Контесты'

    table = tableDiv.addEdge(BaseHtmlItem('table'))
    COLUMS_NAMES = ['col-0', 'col-1', 'col-2', 'col-3', 'col-4', 'col-5']
    table.addEdge(BaseHtmlItem('tr'))\
         .addMultipleEdges(BaseHtmlItem('th'), ['Платформа', 'Дата', 'Название', 'Начало', 'Конец', 'Длительность'], className=COLUMS_NAMES)

    for contest in contests:
        tr = table.addEdge(BaseHtmlItem('tr'))
        tr.addEdge(BaseHtmlItem('td'), className=COLUMS_NAMES[0])\
          .addEdge(BaseHtmlItem('a'), href=getPlatformLink(contest.platform), target='_blank')\
          .addEdge(BaseHtmlItem('img'), className=f'logo-png', src=f'/images/{contest.platform}_logo.png')

        tr.addMultipleEdges(BaseHtmlItem('td'),
                            [formatDay(floorDateToTheNearestDay(contest.start)),
                             contest.name,
                             formatContestEvent(contest.start),
                             formatContestEvent(contest.end),
                             formatContestDuration(contest.duration)],
                            className=COLUMS_NAMES[1:])

def considerRunningContests(rootHtml: HtmlBuilder, contests: list[Contest]):
    currentTime = getCurrentDateTime()
    runningContests = []
    for contest in contests:
        if contest.start > currentTime:
            break
        runningContests.append(contest)
    considerContestsListHtml(rootHtml, runningContests, 'Сейчас')

def considerFutureContests(rootHtml: HtmlBuilder, contests: list[Contest]):
    currentTime = getCurrentDateTime()
    firstScheduledContest = 0
    while firstScheduledContest < len(contests) and contests[firstScheduledContest].start <= currentTime:
        firstScheduledContest += 1

    if firstScheduledContest < len(contests):
        considerContestsListHtml(rootHtml, contests[firstScheduledContest:], 'Предстоящие')

def buildScheduleHtml(offset: int) -> str:
    contests = [shiftContestBy(contest, offset) for contest in getScheduledContests()]
    contests.sort(key=lambda contest: contest.start)

    rootHtml = HtmlBuilder()
    considerRunningContests(rootHtml, contests)
    considerFutureContests(rootHtml, contests)
    return rootHtml.htmlToStr()
