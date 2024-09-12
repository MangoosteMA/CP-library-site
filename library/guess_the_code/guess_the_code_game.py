from .game_test    import GameTest
from .game         import Game
from .test_verdict import TestVerdict
from .utils        import parseTests

from typing        import Optional

import sqlite3
import subprocess

class GuessTheCodeGame:
    '''
    Variables:
    connection: sqlite3.Connection
    cursor:     sqlite3.Cursor
    '''

    GAMES_TABLE_NAME = 'GuessTheCodeGames'
    DEFAULT_CODE = 'def check(a: int, b: int, c: int) -> bool:\n    return False\n'
    DEFAULT_TESTS_DESCRIBER = 'Random 30 [0,100000] [0,100000] [0,100000]\n'

    def __init__(self, databasePath: str):
        self.connection = sqlite3.connect(databasePath, check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute(f'''CREATE TABLE IF NOT EXISTS {GuessTheCodeGame.GAMES_TABLE_NAME} (
                                {Game.ID}             INTEGER PRIMARY KEY,
                                {Game.CODE}           TEXT,
                                {Game.TESTS_DESCIBER} TEXT
                            )''')
        self.connection.commit()

    def getGameById(self, gameId: int) -> Optional[Game]:
        self.cursor.execute(f'''SELECT * FROM {GuessTheCodeGame.GAMES_TABLE_NAME}
                                WHERE {Game.ID} = (?)
                                LIMIT 1
                            ''', (gameId,))
        gameInfo = self.cursor.fetchone()
        if gameInfo is None:
            return None

        return Game(gameInfo)

    def addNewGame(self) -> int:
        newGameId = self.__getNewGameId()
        self.cursor.execute(f'''INSERT INTO {GuessTheCodeGame.GAMES_TABLE_NAME}
                                ({Game.ID}, {Game.CODE}, {Game.TESTS_DESCIBER})
                                VALUES
                                (?, ?, ?)
                            ''', (newGameId, GuessTheCodeGame.DEFAULT_CODE, GuessTheCodeGame.DEFAULT_TESTS_DESCRIBER))
        self.connection.commit()
        return newGameId

    def updateGame(self, gameId: int, newCode: str, newTestsDescriber: str) -> None:
        self.cursor.execute(f'''UPDATE {GuessTheCodeGame.GAMES_TABLE_NAME}
                                SET {Game.CODE}           = ?,
                                    {Game.TESTS_DESCIBER} = ?
                                WHERE
                                    {Game.ID}             = ?
                            ''', (newCode, newTestsDescriber, gameId))
        self.connection.commit()

    def correctAnswer(self, gameId: int, test: GameTest) -> TestVerdict:
        game = self.getGameById(gameId)
        if game is None:
            return TestVerdict.ERROR

        return self.runCode(game.code, [test])[0]

    def runCode(self, code: str, tests: list[GameTest]) -> list[TestVerdict]:
        result = []
        for test in tests:
            try:
                codeToExecute = code + f'\n\nprint(check({test.a}, {test.b}, {test.c}))'
                p = subprocess.run(['python3', '-c', codeToExecute], stdout=subprocess.PIPE)
                if p.returncode != 0:
                    raise RuntimeError('Code got runtime error')

                out = p.stdout.decode().strip()
                if out == 'False':
                    result.append(TestVerdict.FALSE)
                elif out == 'True':
                    result.append(TestVerdict.TRUE)
                else:
                    raise RuntimeError('Incorrect output type')
            except BaseException as exc:
                result.append(TestVerdict.ERROR)
        return result

    def submit(self, game: Game, code: str) -> bool:
        tests = parseTests(game.testsDescriber)
        for test in tests:
            if self.runCode(code, [test]) != self.runCode(game.code, [test]):
                return False
        
        return True

# Private:
    def __getNewGameId(self) -> int:
        self.cursor.execute(f'SELECT * from {GuessTheCodeGame.GAMES_TABLE_NAME}')
        return len(self.cursor.fetchall()) + 1
