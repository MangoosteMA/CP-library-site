from .user                import User, UserAccess
from .session             import Session
from .sessions_controller import SessionsController

from pathlib              import Path
from typing               import Optional, Dict

import sqlite3

class UsersHandler:
    '''
    Variables:
    connection:         sqlite3.Connection
    cursor:             sqlite3.Cursor
    sessionsController: SessionsController
    '''

    MIN_PASSWORD_LENGTH = 3
    USERS_TABLE_NAME = 'Users'

    def __init__(self, databasePath: str):
        self.connection = sqlite3.connect(databasePath, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute(f'''CREATE TABLE IF NOT EXISTS {UsersHandler.USERS_TABLE_NAME} (
                                {User.USERNAME} TEXT PRIMARY KEY,
                                {User.PASSWORD} TEXT,
                                {User.ACCESS}   INTEGER
                            )''')
        self.connection.commit()
        self.sessionsController = SessionsController()

    def registreUser(self, username: str, password: str, access: UserAccess) -> User:
        registeredUser = self.__getUserByUsername(username)
        if registeredUser is not None and registeredUser.username == username:
            raise Exception('Login is already used')

        try:
            self.cursor.execute(f'''INSERT INTO {UsersHandler.USERS_TABLE_NAME}
                                    ({User.USERNAME}, {User.PASSWORD}, {User.ACCESS})
                                    VALUES
                                    (?, ?, ?)
                                ''', (username, password, access.value))
            self.connection.commit()
            return self.__getUserByUsername(username)
        except BaseException as exc:
            print(f'While registering user error happened: {exc}')
            raise Exception('Something went wrong')

    def validatePassword(self, password: str) -> None:
        if len(password) < UsersHandler.MIN_PASSWORD_LENGTH:
            raise Exception(f'Password length must be at least {UsersHandler.MIN_PASSWORD_LENGTH}')

    def getUser(self, username: str, password: str) -> User:
        user = self.__getUserByUsername(username)
        if user is None:
            raise Exception('Incorrect login')
        
        if user.password != password:
            raise Exception('Incorrect password')

        return user

    def createSession(self, user: User) -> Session:
        return self.sessionsController.createSession(user)

    def getSessionByKey(self, key: str) -> Optional[Session]:
        return self.sessionsController.getSessionByKey(key)

# Private:
    def __getUserByUsername(self, username: str) -> Optional[User]:
        self.cursor.execute(f'''SELECT * FROM {UsersHandler.USERS_TABLE_NAME}
                                where {User.USERNAME} = (?)
                                LIMIT 1
                                ''', (username,))
        userInfo = self.cursor.fetchone()
        if userInfo is None:
            return None

        return User(userInfo)
