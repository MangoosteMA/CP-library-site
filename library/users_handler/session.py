from .user    import User

from datetime import datetime
from secrets  import token_hex

class Session:
    '''
    Variables:
    user:         User
    key:          str
    creationDate: datetime
    '''

    def __init__(self, user: User):
        self.user = user
        self.key = token_hex()
        self.creationDate = datetime.now()
