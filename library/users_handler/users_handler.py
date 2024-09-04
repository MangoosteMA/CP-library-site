from .user                import User
from .session             import Session
from .sessions_controller import SessionsController

from pathlib              import Path
from typing               import Optional, Dict

MIN_PASSWORD_LENGTH = 3

class UsersHandler:
    '''
    Variables:
    storagePath:        Path
    users:              List[User]
    sessionsController: SessionsController
    '''

    def __init__(self, storagePath: str):
        self.storagePath = Path(storagePath)
        self.__loadUsers()
        self.sessionsController = SessionsController()

    def registreUser(self, username: str, password: str, admin: bool) -> User:
        for user in self.users:
            if user.username == username:
                raise Exception('Login is already used')

        try:
            user = User(username=username, password=password, admin=admin)
            self.users.append(user)
            self.__storeUsers()
            return user
        except:
            raise Exception('Something went wrong')

    def validatePassword(self, password: str) -> None:
        if len(password) < MIN_PASSWORD_LENGTH:
            raise Exception(f'Password length must be at least {MIN_PASSWORD_LENGTH}')

    def getUser(self, username: str, password: str) -> User:
        for user in self.users:
            if user.username != username:
                continue

            if user.password != password:
                raise Exception('Incorrect password')

            return user

        raise Exception('Incorrect login')

    def createSession(self, user: User) -> Session:
        return self.sessionsController.createSession(user)

    def getSessionByKey(self, key: str) -> Optional[Session]:
        return self.sessionsController.getSessionByKey(key)

# Private:
    def __loadUsers(self) -> None:
        with self.storagePath.open('w+'):
            pass

        self.users = []
        with self.storagePath.open('r') as database:
            for userInfo in database.read().split('\n'):
                if len(userInfo) == 0:
                    continue

                self.users.append(User(dataDict=eval(userInfo)))

    def __storeUsers(self) -> None:
        with self.storagePath.open('w') as database:
            for user in self.users:
                print(str(user), file=database)
