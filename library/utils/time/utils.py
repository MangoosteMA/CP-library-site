import datetime
from pandas import Timestamp
import time

def floorDateToTheNearestDay(date: datetime.datetime) -> datetime.datetime:
    timestamp = Timestamp(date).floor('1d')
    return datetime.datetime.strptime(timestamp.ctime(), '%c')

def getCurrentDateTime() -> datetime.datetime:
    return datetime.datetime.strptime(time.ctime(), '%c')

