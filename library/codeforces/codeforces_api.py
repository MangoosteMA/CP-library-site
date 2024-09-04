from library.base       import Contest, Platform
from library.common     import getPageHtmlCode
from library.utils.time import getCurrentDateTime

import datetime
import json

from typing import Optional

UTC_BASE = datetime.datetime(1970, 1, 1)
CODEFORCES_MAIN_PAGE = 'https://codeforces.com'

def statusIsOk(response: dict) -> bool:
    STATUS = 'status'
    return STATUS in response and response[STATUS] == 'OK'

def requestAPI(method: str) -> Optional[dict]:
    responseJson = getPageHtmlCode(f'{CODEFORCES_MAIN_PAGE}/api/{method}')
    if responseJson is None:
        return None

    try:
        response = json.loads(responseJson)
    except:
        return None

    RESULT = 'result'
    if statusIsOk(response) and RESULT in response:
        return response[RESULT]
    return None

def tryParseContestFromJson(contestJson: dict) -> Contest:
    try:
        return Contest(name=contestJson['name'],
                       duration=contestJson['durationSeconds'],
                       start=UTC_BASE + datetime.timedelta(seconds=contestJson['startTimeSeconds']),
                       platform=Platform.CODEFORCES)
    except BaseException as exc:
        print(f'Failed to parse contest. Reason: {exc}')
        return None

def getContestsList() -> list[Contest]:
    contestJsonList = requestAPI('contest.list')
    if contestJsonList is None:
        return []

    contests = []
    for contestJson in contestJsonList:
        parsedContest = tryParseContestFromJson(contestJson)
        if parsedContest is not None:
            contests.append(parsedContest)
    return contests

def getScheduledContestsList() -> list[Contest]:
    currentTime = getCurrentDateTime()
    return [contest for contest in getContestsList() if contest.end >= currentTime]
