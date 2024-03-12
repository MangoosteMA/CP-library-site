import shelve

class User2:
    def __init__(self, login, password):
        self.login = login
        self.password = password
        self.fuck = 'flex'
        self.sad = 'sad'

# database = shelve.open('tmp.txt')
# # user = {'a': 1, 'b': 'aboba'}
# user = User(login='aboba', password='kek')
# database['key'] = user

# database.close()

database = shelve.open('tmp.txt')
value = database['key']
print(value)
print(value.login, value.password)
print(type(value))
print(User)
print(type(value) == User)
# print(value.fuck)
# print(value.sad)