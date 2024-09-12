from library.users_handler import UsersHandler

import os

DATABASE_STORAGE_PATH = 'data/users/users.db'
os.makedirs(os.path.dirname(DATABASE_STORAGE_PATH), exist_ok=True)
usersHandler = UsersHandler(DATABASE_STORAGE_PATH)
