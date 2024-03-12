import secrets

from flask import Flask
from views import view

def main():
    app = Flask(__name__)
    app.secret_key = secrets.token_hex()
    app.register_blueprint(view, url_prefix='/')
    app.run(debug=True, port=1337)

if __name__ == '__main__':
    main()
