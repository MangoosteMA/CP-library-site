from backend.api              import buildLibraryBodyHtml
from backend.api              import buildScheduleHtml
from backend.api              import guessTheCodeGame
from backend.api              import papersContainerAlgo
from backend.api              import papersContainerDev
from backend.api              import usersHandler

from library.guess_the_code   import GameTest
from library.papers_container import PapersContainer
from library.users_handler    import User, UserAccess

from flask                    import abort
from flask                    import Blueprint
from flask                    import redirect
from flask                    import render_template
from flask                    import request
from flask                    import send_file
from flask                    import session

from dataclasses              import dataclass
from pathlib                  import Path
from secrets                  import token_urlsafe
from typing                   import Optional

view = Blueprint('views', __name__)

SESSION_KEY = 'session'
SECRET_REGULAR = token_urlsafe(15)
SECRET_ADMIN = token_urlsafe(15)

with open('data/users/secret.txt', 'w') as secretFile:
    secretFile.write(SECRET_REGULAR + '\n')
    secretFile.write(SECRET_ADMIN + '\n')

@dataclass
class BaseSessionInfo:
    loggedIn: bool
    access:   UserAccess
    username: str

def logOut() -> None:
    if SESSION_KEY in session:
        session.pop(SESSION_KEY)

def getSessionInfo() -> BaseSessionInfo:
    runningSession = usersHandler.getSessionByKey(session.get(SESSION_KEY, ''))
    if runningSession is None:
        return BaseSessionInfo(loggedIn=False, access=UserAccess.NONE, username='')
    
    return BaseSessionInfo(loggedIn=True,
                           access=runningSession.user.access,
                           username=runningSession.user.username)

def renderTemplate(path: str, **kwargs):
    sessionInfo = getSessionInfo()
    if not sessionInfo.loggedIn:
        logOut()

    return render_template(path,
                           loggedIn=sessionInfo.loggedIn,
                           admin=sessionInfo.access == UserAccess.ADMIN,
                           username=sessionInfo.username,
                           **kwargs)

@view.route('/', methods=['GET', 'POST'])
def homePage():
    return renderTemplate('home_page/home_page.html')

def tryLoginUser() -> str:
    login = request.form['login']
    password = request.form['password']

    try:
        user = usersHandler.getUser(login, password)
        session[SESSION_KEY] = usersHandler.createSession(user).key
    except BaseException as exc:
        return str(exc)

    return ''

@view.route('/login', methods=['GET', 'POST'])
def loginPage():
    if request.method == 'POST':
        return tryLoginUser()

    return renderTemplate('login_page/login_page.html')

def tryRegisterUser() -> str:
    username = request.form['login']
    password = request.form['password']
    rpassword = request.form['rpassword']
    secret = request.form['secret']

    if len(username) == 0:
        return 'Empty login is not allowed'

    if password != rpassword:
        return 'Passwords don\'t match'

    if secret != SECRET_REGULAR and secret != SECRET_ADMIN:
        return 'Incorrect secret'

    try:
        usersHandler.validatePassword(password)
        access = UserAccess.ADMIN if secret == SECRET_ADMIN else UserAccess.REGULAR
        user = usersHandler.registreUser(username, password, access)
        session[SESSION_KEY] = usersHandler.createSession(user).key
    except BaseException as exc:
        return str(exc)

    return ''

@view.route('/register', methods=['GET', 'POST'])
def registerPage():
    if request.method == 'POST':
        return tryRegisterUser()

    return renderTemplate('register_page/register_page.html')

@view.route('/log-out', methods=['POST'])
def loggedOutPage():
    logOut()
    return homePage()

def libraryPage(papersContainer: PapersContainer):
    if request.method == 'POST' and getSessionInfo().access == UserAccess.ADMIN:
        try:
            papersContainer.updateConfig(request.data.decode())
        except:
            abort(406)

    try:
        libraryBody = buildLibraryBodyHtml(papersContainer, getSessionInfo().access == UserAccess.ADMIN)
        libraryConfig = papersContainer.getConfig()
    except BaseException as exc:
        print(f'Failed to build library html body. Reason: {exc}')
        libraryBody = ''
        libraryConfig = ''

    return renderTemplate('library_page/library_page.html',
                           libraryBody=libraryBody,
                           libraryConfig=libraryConfig)

@view.route('/library-algo', methods=['GET', 'POST'])
def libraryPageAlgo():
    return libraryPage(papersContainerAlgo)

@view.route('/library-dev', methods=['GET', 'POST'])
def libraryPageDev():
    return libraryPage(papersContainerDev)

def libraryFileInfoPage(papersContainer: PapersContainer, htmlName: str):
    try:
        if request.method == 'POST' and getSessionInfo().access == UserAccess.ADMIN:
            content = request.get_json()
            method = content['method']
            if method == 'save':
                papersContainer.compileMtex(htmlName, content['data'])
            elif method == 'rename':
                papersContainer.renamePaper(content['prevHtmlName'], content['htmlName'],
                                            content['fileName'], content['filePath'])
                return ''

        return renderTemplate(f'library_page/library_file_info.html',
                              fileInfo=render_template(papersContainer.getHtmlPath(htmlName)),
                              htmlName=htmlName,
                              fileName=papersContainer.getFileName(htmlName),
                              filePath=papersContainer.getFilePath(htmlName),
                              mtexData=papersContainer.getMtexSource(htmlName))
    except:
        return f'Error happened while handling request to {htmlName}.'

@view.route('/library-algo/<htmlName>', methods=['GET', 'POST'])
def libraryFileInfoPageAlgo(htmlName: str):
    return libraryFileInfoPage(papersContainerAlgo, htmlName)

@view.route('/library-dev/<htmlName>', methods=['GET', 'POST'])
def libraryFileInfoPageDev(htmlName: str):
    return libraryFileInfoPage(papersContainerDev, htmlName)

@view.route('/apps/graph-editor', methods=['GET'])
def graphEditorPage():
    return renderTemplate('graph_editor/graph_editor.html')

@view.route('/api/schedule', methods=['GET'])
def apiSchedule():
    try:
        offset = int(request.args.get('offset', 0))
    except:
        offset = 0

    return buildScheduleHtml(offset)

@view.route('/images/<image>', methods=['GET'])
def sendFile(image: str):
    path = f'data/images/{image}'
    if Path(path).is_file():
        return send_file(path, mimetype='image/gif')

    abort(404)

@view.route('/secret/login-secrets')
def secretLoginSecrets():
    if getSessionInfo().access == UserAccess.ADMIN:
        return f'Regular: {SECRET_REGULAR}\nAdmin: {SECRET_ADMIN}\n'

    abort(403)

@view.route('/apps/guess-the-code/new-game', methods=['GET'])
def guessTheCodeNewGamePage():
    if getSessionInfo().access != UserAccess.ADMIN:
        abort(403)

    newGameId = guessTheCodeGame.addNewGame()
    return redirect(f'/apps/guess-the-code/game/{newGameId}')

@view.route('/apps/guess-the-code/game/<int:gameId>', methods=['GET', 'POST'])
def guessTheCodePage(gameId: int):
    game = guessTheCodeGame.getGameById(gameId)
    if game is None:
        abort(404)

    if request.method == 'POST':
        content = request.get_json()
        method = content['method']
        if method == 'add_test':
            verdict = guessTheCodeGame.correctAnswer(gameId, GameTest(int(content['a']), int(content['b']), int(content['c'])))
            return str(verdict.value)
        elif method == 'run_code':
            tests = [GameTest(int(data['a']), int(data['b']), int(data['c'])) for data in content['tests']]
            result = guessTheCodeGame.runCode(content['code'], tests)
            return ','.join([str(verdict.value) for verdict in result])
        elif method == 'submit':
            return str(guessTheCodeGame.submit(game, content['code']))
        elif method == 'update_game' and getSessionInfo().access == UserAccess.ADMIN:
            guessTheCodeGame.updateGame(gameId, content['code'], content['testsDescriber'])

    return renderTemplate('guess_the_code/guess_the_code_game.html',
                          gameId=gameId,
                          gameCode=game.code,
                          testsDescriber=game.testsDescriber)
