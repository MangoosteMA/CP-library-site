from typing import Dict
from enum   import Enum

class UserAccess(Enum):
    NONE = 0
    REGULAR = 1
    ADMIN = 2

class User:
    '''
    Variables:
    username: str
    password: str
    access:   UserAccess
    '''

    USERNAME = 'username'
    PASSWORD = 'password'
    ACCESS   = 'access'

    def __init__(self, data: Dict = {}):
        self.username = data[User.USERNAME]
        self.password = data[User.PASSWORD]
        self.access   = UserAccess(data[User.ACCESS])
