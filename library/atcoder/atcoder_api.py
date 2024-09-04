from library.base      import Contest, Platform
from library.common    import getPageHtmlCode
from library.utils.str import removeAllNonASCIISymbols

from bs4               import BeautifulSoup
from datetime          import datetime, timedelta

ATCODER_MAIN_PAGE = 'https://atcoder.jp'
JAPAN_UTC = timedelta(hours=9)

def parseDatetimeFromStr(time: str) -> datetime:
    return datetime.strptime(time, '%Y-%m-%d %H:%M:%S+0900')

# returns contest duration in seconds or None
def getContestDuration(link: str) -> int:
    try:
        htmlCode = getPageHtmlCode(link)
        htmlParser = BeautifulSoup(htmlCode, 'html.parser')
        durationNode = htmlParser.find('small', {'class' : 'contest-duration'})
        borders = [parseDatetimeFromStr(node.text) for node in durationNode.find_all('time')]
        return int((borders[1] - borders[0]).total_seconds())
    except BaseException as exc:
        print(f'Failed to get contest duration. Reason: {exc}')
        return None

def tryParseScheduledContests() -> list[Contest]:
    try:
        htmlCode = getPageHtmlCode(ATCODER_MAIN_PAGE)
        htmlParser = BeautifulSoup(htmlCode, 'html.parser')
        upcomingContestsDiv = htmlParser.find('div', {'id' : 'contest-table-upcoming'})
        contestsBody = upcomingContestsDiv.find('tbody')

        parsedContests = []
        for contestInfo in contestsBody.find_all('tr'):
            try:
                nodes = [node for node in contestInfo.find_all('td')]
                if len(nodes) != 2:
                    continue

                linkPath = nodes[1].find('a').get('href')
                contestLink = f'{ATCODER_MAIN_PAGE}{linkPath}'
                parsedContests.append(Contest(name=removeAllNonASCIISymbols(nodes[1].text).strip(),
                                              duration=getContestDuration(contestLink),
                                              start=parseDatetimeFromStr(nodes[0].text) - JAPAN_UTC,
                                              platform=Platform.ATCODER))
            except BaseException as exc:
                print(f'Failed to parse contest. Reason: {exc}')
        return parsedContests
    except BaseException as exc:
        print(f'Failed to parse contests. Reason: {exc}')
        return None
