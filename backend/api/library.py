from library.utils.html import HtmlBuilder, BaseHtmlItem
from library.utils.mtex import MtexParser

from collections        import OrderedDict
from dataclasses        import dataclass
from json               import JSONDecoder
from pathlib            import Path

class Folder:
    '''
    Variables:
    folderName: str
    items:      list[Folder or File]
    '''

    def __init__(self, folderName):
        self.folderName = folderName
        self.items = []

    def addItem(self, item):
        self.items.append(item)

@dataclass
class File:
    fileName: str
    codePath: str
    htmlPath: str

LIBRARY_CONFIG_PATH_ALGO = 'data/config/library_algo.json'
LIBRARY_CODE_PATH_ALGO = 'data/library_algo'
LIBRARY_HTML_PATH_ALGO = 'templates/library_page/library_algo'

CODE_PATH = 'code_path'
HTML_PATH = 'html_path'

def parseConfig(path: Path) -> OrderedDict:
    with path.open() as configFile:
        configStr = configFile.read()
    jsonDecoder = JSONDecoder(object_pairs_hook=OrderedDict)
    return jsonDecoder.decode(configStr)

def isItemFile(item: OrderedDict) -> bool:
    return (CODE_PATH in item) and (HTML_PATH in item) and (len(item) == 2)

def parseFoldersAndFiles(config: OrderedDict, name='unknown') -> Folder:
    parsedFolder = Folder(name)
    for name, item in config.items():
        if isItemFile(item):
            parsedFolder.addItem(File(fileName=name,
                                      codePath=item[CODE_PATH],
                                      htmlPath=item[HTML_PATH]))
        else:
            parsedFolder.addItem(parseFoldersAndFiles(item, name))
    return parsedFolder

# returns next free folderId
def addButtonsDfs(folder: Folder, htmlBuilder: HtmlBuilder, folderId=1, tabs=0) -> int:
    TAB_SIZE = 40 # px
    BUTTON_BASE_NAME = 'library-file-folder-button'
    for item in folder.items:
        isFile = isinstance(item, File)
        if isinstance(item, File):
            # TODO: get rid of library-algo only
            currentButton = htmlBuilder.addEdge(BaseHtmlItem('button'),
                                                className=BUTTON_BASE_NAME,
                                                style=f'padding-left: {(tabs + 1) * TAB_SIZE}px;',
                                                onclick=f'window.open(\'/library-algo/{item.htmlPath}\', \'_blank\')')
        else:
            currentButton = htmlBuilder.addEdge(BaseHtmlItem('button'),
                                                className=BUTTON_BASE_NAME,
                                                style=f'padding-left: {(tabs + 1) * TAB_SIZE}px;',
                                                id=f'algo-button-{folderId}',
                                                onclick='folderButtonClicked(this.id)')

        imageSource = '/images/' + ('file' if isFile else 'folder') + '.png'
        title = item.fileName if isFile else item.folderName
        currentButton.addEdge(BaseHtmlItem('div'), className='library-file-folder-inside-div')\
                     .addMultipleEdges(BaseHtmlItem('div'),
                                       innerHtml=[f'<img src={imageSource} class=\"file-folder-image\">', title],
                                       className=['image-div', 'file-folder-name-div'])
        if isFile:
            continue

        folderId = addButtonsDfs(item,
                                 htmlBuilder.addEdge(BaseHtmlItem('div'), className='folder-items-div', id=f'algo-div-{folderId}'),
                                 folderId + 1,
                                 tabs + 1)
    return folderId

def buildLibraryDiv(rootHtml: HtmlBuilder, folder: Folder):
    mainDiv = rootHtml.addEdge(BaseHtmlItem('div'), className='library-div')
    mainDiv.addEdge(BaseHtmlItem('div'), className='library-title-div').innerHtml = 'Алгоритмы'
    addButtonsDfs(folder, mainDiv)

def buildLibraryBodyHtml() -> str:
    configAlgo = parseConfig(Path(LIBRARY_CONFIG_PATH_ALGO))
    rootHtml = HtmlBuilder()
    buildLibraryDiv(rootHtml, parseFoldersAndFiles(configAlgo))
    return rootHtml.htmlToStr()

def getSourceCodeFile(htmlName) -> str:
    def dfsConfig(folder: Folder) -> str:
        for item in folder.items:
            if isinstance(item, File):
                if str(item.htmlPath) == htmlName:
                    return item.codePath
            else:
                result = dfsConfig(item)
                if result is not None:
                    return result
        return None

    sourcePath = dfsConfig(parseFoldersAndFiles(parseConfig(Path(LIBRARY_CONFIG_PATH_ALGO))))
    try:
        with open(f'data/library_algo/{sourcePath}') as sourceFile:
            return sourceFile.read().strip()
    except:
        return None

def compileMtexTo(mtexPath: str, destFile: str):
    with open(mtexPath, 'r') as mtexFile:
        mtexData = mtexFile.read()
    
    parser = MtexParser(mtexData)
    resultHtml = parser.compileHtml().htmlToStr()

    with open(destFile, 'w') as dest:
        dest.write(resultHtml)

def getMtexSourceFileData(mtexPath: str) -> str:
    try:
        with open(mtexPath, 'r') as mtexFile:
            fileData = mtexFile.read()
        return fileData
    except:
        return ''
