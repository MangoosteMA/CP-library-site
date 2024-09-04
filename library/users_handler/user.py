from typing import Dict

class User:
    '''
    Variables:
    username: str
    password: str
    admin:    bool
    '''

    USERNAME = 'username'
    PASSWORD = 'password'
    ADMIN    = 'admin'

    def __init__(self, dataDict: Dict = {}, username: str = None, password: str = None, admin: bool = None):
        if username is not None:
            dataDict[User.USERNAME] = username
        if password is not None:
            dataDict[User.PASSWORD] = password
        if admin is not None:
            dataDict[User.ADMIN] = admin

        self.username = dataDict[User.USERNAME]
        self.password = dataDict[User.PASSWORD]
        self.admin    = dataDict[User.ADMIN]

    def __str__(self) -> str:
        info = {}
        info[User.USERNAME] = self.username
        info[User.PASSWORD] = self.password
        info[User.ADMIN]    = self.admin
        return str(info)
