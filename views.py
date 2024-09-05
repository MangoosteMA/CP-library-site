from backend.api              import buildLibraryBodyHtml
from backend.api              import buildScheduleHtml
from backend.api              import papersContainerAlgo
from backend.api              import papersContainerDev
from backend.api              import usersHandler

from library.papers_container import PapersContainer

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
    admin:    bool
    username: str

def logOut():
    if SESSION_KEY in session:
        session.pop(SESSION_KEY)

def getSessionInfo() -> BaseSessionInfo:
    runningSession = usersHandler.getSessionByKey(session.get(SESSION_KEY, ''))
    if runningSession is None:
        return BaseSessionInfo(loggedIn=False, admin=False, username='')
    
    return BaseSessionInfo(loggedIn=True,
                           admin=runningSession.user.admin,
                           username=runningSession.user.username)

def renderTemplate(path, **kwargs):
    sessionInfo = getSessionInfo()
    if not sessionInfo.loggedIn:
        logOut()

    return render_template(path,
                           loggedIn=sessionInfo.loggedIn,
                           admin=sessionInfo.admin,
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
        user = usersHandler.registreUser(username, password, secret == SECRET_ADMIN)
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
    if request.method == 'POST' and getSessionInfo().admin:
        try:
            papersContainer.updateConfig(request.data.decode())
        except:
            abort(406)

    try:
        libraryBody = buildLibraryBodyHtml(papersContainer, getSessionInfo().admin)
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

@view.route('/library-algo/<htmlName>', methods=['GET', 'POST'])
def libraryAlgoPage(htmlName: str):
    try:
        if request.method == 'POST' and getSessionInfo().admin:
            content = request.get_json()
            method = content['method']
            if method == 'save':
                papersContainerAlgo.compileMtex(htmlName, content['data'])
            elif method == 'rename':
                papersContainerAlgo.renamePaper(content['prevHtmlName'], content['htmlName'],
                                            content['fileName'], content['filePath'])
                return ''

        return renderTemplate(f'library_page/library_file_info.html',
                              fileInfo=render_template(papersContainerAlgo.getHtmlPath(htmlName)),
                              htmlName=htmlName,
                              fileName=papersContainerAlgo.getFileName(htmlName),
                              filePath=papersContainerAlgo.getFilePath(htmlName),
                              mtexData=papersContainerAlgo.getMtexSource(htmlName))
    except:
        return f'Error happened while handling request to {htmlName}.'

@view.route('/apps/<app>', methods=['GET'])
def appsPage(app):
    if app == 'graph-editor':
        return renderTemplate('graph_editor/graph_editor.html')

    return f'There is no such app yet: {app}'

@view.route('/api/schedule', methods=['GET'])
def apiSchedule():
    try:
        offset = int(request.args.get('offset', 0))
    except:
        offset = 0

    return buildScheduleHtml(offset)

@view.route('/images/<image>', methods=['GET'])
def sendFile(image):
    path = f'data/images/{image}'
    if Path(path).is_file():
        return send_file(path, mimetype='image/gif')

    return 'There is not such image ;('

@view.route('/secret/login-secrets')
def secretLoginSecrets():
    if getSessionInfo().admin:
        return f'Regular: {SECRET_REGULAR}\nAdmin: {SECRET_ADMIN}\n'
    return 'banned!'
