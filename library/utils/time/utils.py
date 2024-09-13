from datetime import datetime
from pandas   import Timestamp
import time

def floorDateToTheNearestDay(date: datetime) -> datetime:
    timestamp = Timestamp(date).floor('1d')
    return datetime.strptime(timestamp.ctime(), '%c')

def getCurrentDateTime() -> datetime:
    return datetime.strptime(time.ctime(), '%c')
