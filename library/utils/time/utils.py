from datetime import datetime
from pandas   import Timestamp

def floorDateToTheNearestDay(date: datetime) -> datetime:
    timestamp = Timestamp(date).floor('1d')
    return datetime.strptime(timestamp.ctime(), '%c')

def getCurrentDateTime() -> datetime:
    return datetime.utcnow()
