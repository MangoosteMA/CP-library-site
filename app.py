from flask   import Flask
from secrets import token_hex
from views   import view

app = Flask(__name__)
app.secret_key = token_hex()
app.register_blueprint(view, url_prefix='/')

def main():
    app.run(debug=True, port=1337)

if __name__ == '__main__':
    main()
