from backend.api import buildLibraryBodyHtml
from backend.api import buildScheduleHtml
from backend.api import compileMtexTo
from backend.api import getMtexSourceFileData
from backend.api import getSourceCodeFile

from flask       import Blueprint
from flask       import render_template
from flask       import request
from flask       import send_file
from flask       import session
from pathlib     import Path

import json

view = Blueprint('views', __name__)

@view.route('/', methods=['GET', 'POST'])
def homePage():
    return render_template('home_page/home_page.html')

@view.route('/login', methods=['GET', 'POST'])
def loginPage():
    return render_template('login_page/login_page.html')

@view.route('/register', methods=['GET', 'POST'])
def registerPage():
    return render_template('register_page/register_page.html')

@view.route('/library', methods=['GET', 'POST'])
def libraryPage():
    try:
        libraryBody = buildLibraryBodyHtml()
    except BaseException as exc:
        print(f'Failed to build library html body. Reason: {exc}')
        libraryBody = ''
    return render_template('library_page/library_page.html', libraryBody=libraryBody)

@view.route('/library-algo/<filePath>', methods=['GET', 'POST'])
def libraryAlgoPage(filePath):
    pathPrefix = f'library_page/library_algo/{filePath}'
    htmlPath = f'{pathPrefix}.html'
    mtexPath = f'templates/{pathPrefix}.mtex'

    try:
        if request.method == 'POST':
            with open(mtexPath, 'w') as mtexFile:
                mtexFile.write(json.loads(request.data.decode())['newData'])
            compileMtexTo(mtexPath, f'templates/{htmlPath}')

        return render_template(f'library_page/library_file_info.html',
                               fileInfo=render_template(htmlPath, mainCpp=getSourceCodeFile(filePath)),
                               filePath=filePath,
                               mtexData=getMtexSourceFileData(mtexPath))
    except:
        return f'Error happened while handling request to {filePath}.'

@view.route('/apps/<app>', methods=['GET'])
def appsPage(app):
    if app == 'graph-editor':
        return render_template('graph_editor/graph_editor.html')
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
