from library.papers_container import PapersContainer, Paper
from library.utils.html       import HtmlBuilder, BaseHtmlItem

LIBRARY_CONFIG_PATH_ALGO = 'data/config/library_algo.json'
LIBRARY_STORAGE_PATH_ALGO = 'templates/library_page/library_algo'
papersContainerAlgo = PapersContainer('Алгоритмы', 'library-algo', LIBRARY_CONFIG_PATH_ALGO, LIBRARY_STORAGE_PATH_ALGO)

LIBRARY_CONFIG_PAHT_DEV = 'data/config/library_dev.json'
LIBRARY_STORAGE_PATH_DEV = 'templates/library_page/library_dev'
papersContainerDev = PapersContainer('Разработка', 'library-dev', LIBRARY_CONFIG_PAHT_DEV, LIBRARY_STORAGE_PATH_DEV)

TAB_SIZE = 40 # px
BUTTON_BASE_NAME = 'library-file-folder-button'
BUTTON_BASE_NAME_DRAFT = 'library-file-folder-button-draft'

def appendFolderButton(parent: HtmlBuilder, folderName: str, tabs: int, folderId: int) -> HtmlBuilder:
    button = parent.addEdge(BaseHtmlItem('button'),
                            className=BUTTON_BASE_NAME,
                            style=f'padding-left: {(tabs + 1) * TAB_SIZE}px;',
                            id=f'algo-button-{folderId}',
                            onclick='folderButtonClicked(this.id)')
    
    button.addEdge(BaseHtmlItem('div'), className='library-file-folder-inside-div')\
          .addMultipleEdges(BaseHtmlItem('div'),
                            innerHtml=[f'<img src=/images/folder.png class=\"file-folder-image\">', folderName],
                            className=['image-div', 'file-folder-name-div'])

    return parent.addEdge(BaseHtmlItem('div'), className='folder-items-div', id=f'algo-div-{folderId}')

def appendFileButton(parent: HtmlBuilder, paper: Paper, tabs: int, url: str) -> None:
    button = parent.addEdge(BaseHtmlItem('button'),
                            className=BUTTON_BASE_NAME_DRAFT if paper.isDraft() else BUTTON_BASE_NAME,
                            style=f'padding-left: {(tabs + 1) * TAB_SIZE}px;',
                            onclick=f'window.location.replace(\'/{url}/{paper.htmlName}\')')

    button.addEdge(BaseHtmlItem('div'), className='library-file-folder-inside-div')\
          .addMultipleEdges(BaseHtmlItem('div'),
                            innerHtml=[f'<img src=/images/file.png class=\"file-folder-image\">', paper.fileName],
                            className=['image-div', 'file-folder-name-div'])

def buildHtmlButtons(papersContainer: PapersContainer, container: HtmlBuilder, admin: bool) -> None:
    path = [container]
    folders = []
    folderId = 0

    for paper in papersContainer.getPapers():
        if not admin and paper.isDraft():
            continue

        lca = paper.lca(Paper(folders=folders, fileName=None, htmlName=None))
        path = path[0 : lca + 1]
        folders = folders[: lca]
        for i in range(lca, len(paper.folders)):
            path.append(appendFolderButton(path[-1], paper.folders[i], i, folderId))
            folders.append(paper.folders[i])
            folderId += 1

        appendFileButton(path[-1], paper, len(folders), papersContainer.getUrl())

def buildLibraryBodyHtml(papersContainer: PapersContainer, admin: bool) -> str:
    rootHtml = HtmlBuilder()
    container = rootHtml.addEdge(BaseHtmlItem('div'), className='library-div')
    container.addEdge(BaseHtmlItem('div'), className='library-edit-button', id='library-edit-button').innerHtml = 'Edit'
    container.addEdge(BaseHtmlItem('div'), className='library-title-div').innerHtml = papersContainer.getTitle()
    buildHtmlButtons(papersContainer, container, admin)
    return rootHtml.htmlToStr()
