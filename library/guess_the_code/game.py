from typing import Dict

class Game:
    '''
    Variables:
    id:             int
    code:           str
    testsDescriber: str
    '''

    ID = 'id'
    CODE = 'code'
    TESTS_DESCIBER = 'testsDescriber'

    def __init__(self, data: Dict):
        self.id = int(data[Game.ID])
        self.code = data[Game.CODE]
        self.testsDescriber = data[Game.TESTS_DESCIBER]
