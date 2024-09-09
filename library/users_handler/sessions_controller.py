from .session import Session
from .user    import User

from datetime import datetime, timedelta
from typing   import Optional
from queue    import Queue

class SessionsController:
    '''
    Variables:
    sessionsDict:  Dict[str, Session]
    creationQueue: Queue[Session]
    '''

    EXPIRATION_DATE = timedelta(days=10)

    def __init__(self):
        self.sessionsDict = {}
        self.creationQueue = Queue()

    def createSession(self, user: User) -> Session:
        while True:
            session = Session(user)
            if session.key not in self.sessionsDict:
                break

        self.sessionsDict[session.key] = session
        self.creationQueue.put(session)
        return session
    
    def getSessionByKey(self, key: str) -> Optional[Session]:
        self.__removeExpiredSessions()
        return self.sessionsDict.get(key, None)

# Private:
    def __removeExpiredSessions(self) -> None:
        while not self.creationQueue.empty()\
              and datetime.now() - self.creationQueue.queue[0].creationDate > SessionsController.EXPIRATION_DATE:
            expiredSession = self.creationQueue.get()
            self.sessionsDict.pop(expiredSession.key)
