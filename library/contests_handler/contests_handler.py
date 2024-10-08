from library.atcoder    import tryParseScheduledContests as tryParseScheduledContestsAtcoder
from library.base       import Contest, Platform
from library.codeforces import getScheduledContestsList as tryParseScheduledContestsCodeforces

from datetime           import timedelta
from threading          import Timer, Lock

class ContestsHandler:
    '''
    Variables:
    updateTime:            timedelta
    platformToContestDict: dict[Platform, list[Contest]]
    contests:              list[Contest]
    contestsMutex:         Lock
    '''

    def __init__(self, updateTime: timedelta):
        self.updateTime = updateTime
        self.platformToContestDict = {}
        self.contests = []
        self.contestsMutex = Lock()

        self.__scheduleNewUpdate(True)

    def getContests(self) -> list[Contest]:
        with self.contestsMutex:
            return self.contests

# Private:
    def __updatePlatformContests(self, platform: Platform, contests: list[Contest]) -> None:
        if contests is not None:
            self.platformToContestDict[platform] = contests

    def __updateContestsInfo(self) -> None:
        try:
            self.__updatePlatformContests(Platform.CODEFORCES, tryParseScheduledContestsCodeforces())
            self.__updatePlatformContests(Platform.ATCODER, tryParseScheduledContestsAtcoder())

            parsedContests = []
            for platformContests in self.platformToContestDict.values():
                parsedContests += platformContests

            with self.contestsMutex:
                self.contests = parsedContests
        except:
            pass

        self.__scheduleNewUpdate()

    def __scheduleNewUpdate(self, rightNow: bool = False) -> None:
        startIn = (0 if rightNow else int(self.updateTime.seconds))
        timer = Timer(startIn, self.__updateContestsInfo)
        timer.daemon = True
        timer.start()
