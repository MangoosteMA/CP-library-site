from library.guess_the_code import GuessTheCodeGame

import os

DATABASE_STORAGE_PATH = 'data/guess_the_code/games.db'
os.makedirs(os.path.dirname(DATABASE_STORAGE_PATH), exist_ok=True)
guessTheCodeGame = GuessTheCodeGame(DATABASE_STORAGE_PATH)
