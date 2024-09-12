from .game_test import GameTest

from random     import randrange, seed
from typing     import Tuple

DEFAULT_RANDOM_SEED = 228
PARSE_ERROR_MESSAGE = 'Can\'t parse the describer'

def parseRange(data: str) -> Tuple[int, int]:
    if len(data) < 2 or data[0] != '[' or data[-1] != ']':
        raise ValueError(PARSE_ERROR_MESSAGE)

    borders = data[1 : -1].split(',')
    if len(borders) != 2 or not borders[0].isdigit() or not borders[1].isdigit():
        raise ValueError(PARSE_ERROR_MESSAGE)

    return (int(borders[0]), int(borders[1]))

def parseTests(testsDescriber: str) -> list[GameTest]:
    tests = []
    for script in testsDescriber.split('\n'):
        if len(script) == 0:
            continue

        if script.startswith('Random'):
            data = script.split()[1:]
            if len(data) != 4 or not data[0].isdigit():
                raise ValueError(PARSE_ERROR_MESSAGE)

            testsNumber = int(data[0])
            seed(DEFAULT_RANDOM_SEED)

            r1 = parseRange(data[1])
            r2 = parseRange(data[2])
            r3 = parseRange(data[3])
            for testIndex in range(testsNumber):
                tests.append(GameTest(a=randrange(r1[0], r1[1]),
                                      b=randrange(r2[0], r2[1]),
                                      c=randrange(r3[0], r3[1])))
        else:
            raise ValueError(PARSE_ERROR_MESSAGE)

    return tests
