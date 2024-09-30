from .platform import Platform

from copy      import deepcopy
from datetime  import datetime, timedelta

class Contest:
    '''
    Variables:
    name:       str
    duration:   int      (seconds)
    start:      datetime (utc+0)
    end:        datetime (utc+0)
    platform:   Platform
    '''

    def __init__(self, name: str = None, duration: int = None, start: datetime = None, platform: Platform = None):
        self.name = name
        self.duration = duration
        self.start = start

        if duration is None or start is None:
            self.end = None
        else:
            self.end = start + timedelta(seconds=duration)

        self.platform = platform

    def __str__(self) -> str:
        return f'name:       {self.name}      \n' +\
               f'duration:   {self.duration}  \n' +\
               f'start:      {self.start}     \n' +\
               f'end:        {self.end}       \n' +\
               f'platform:   {self.platform}'

    def shiftBy(self, minutes: int) -> None:
        delta = timedelta(minutes=minutes)
        self.start = self.start + delta
        if self.end is not None:
            self.end = self.end + delta


def shiftContestBy(contest: Contest, minutes: int) -> Contest:
    clone = deepcopy(contest)
    clone.shiftBy(minutes)
    return clone
