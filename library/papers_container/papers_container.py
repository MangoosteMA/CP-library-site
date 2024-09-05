from .paper      import Paper

from collections import OrderedDict
from typing      import Optional
import json

class PapersContainer:
    '''
    Variables:
    title:       str
    url:         str
    configPath:  str
    storagePath: str
    papers:      list[Paper]
    configStr:   str
    '''

    def __init__(self, title: str, url: str, configPath: str, storagePath: str):
        self.title = title
        self.url = url
        self.configPath = configPath
        self.storagePath = storagePath
        self.__loadPapers(True)

    def getTitle(self) -> str:
        return self.title

    def getUrl(self) -> str:
        return self.url

    def getPapers(self) -> list[Paper]:
        return self.papers

    def getConfig(self) -> str:
        return self.configStr

    def updateConfig(self, newConfig: str) -> None:
        parsedConfig = self.__parseConfig(newConfig)
        if parsedConfig is None:
            raise Exception("Could't parse the config")

        newPapers = self.__parsePapers(parsedConfig)
        try:
            self.__updatePapers(newPapers)
            self.configStr = newConfig
            with open(self.configPath, 'w') as config:
                config.write(newConfig)
        except:
            self.__loadPapers(False)
            raise Exception("Failed to create/delete papers")

    def getPaperByHtmlName(self, htmlName: str) -> Optional[Paper]:
        for paper in self.getPapers():
            if paper.htmlName == htmlName:
                return paper

        return None

    def getMtexSource(self, htmlName: str) -> str:
        paper = self.getPaperByHtmlName(htmlName)
        if paper is None:
            return ''
        
        with open(paper.fullPath(self.storagePath) + '.mtex', 'r') as file:
            return file.read()

    def compileMtex(self, htmlName: str, mtexCode: str) -> None:
        paper = self.getPaperByHtmlName(htmlName)
        if paper is not None:
            paper.compileMtex(self.storagePath, mtexCode)

    def getHtmlPath(self, htmlName: str) -> str:
        path = self.storagePath + '/' + htmlName + '.html'
        return path[path.find('/') + 1:]

    def getFileName(self, htmlName: str) -> str:
        paper = self.getPaperByHtmlName(htmlName)
        return '' if paper is None else paper.fileName

    def getFilePath(self, htmlName: str) -> str:
        paper = self.getPaperByHtmlName(htmlName)
        return '' if paper is None else '/'.join(paper.folders)

    def renamePaper(self, htmlName: str, newHtmlName: str, newFileName: str, newFolder: str) -> None:
        paper = self.getPaperByHtmlName(htmlName)
        if paper is None:
            return

        mtexCode = self.getMtexSource(htmlName)
        paper.delete(self.storagePath)
        self.papers.remove(paper)

        self.__insertNewPaper(Paper(folders=newFolder.split('/'), fileName=newFileName, htmlName=newHtmlName))
        self.compileMtex(newHtmlName, mtexCode)
        self.__dumpConfig()

# Private:
    def __readConfig(self) -> None:
        with open(self.configPath, 'r') as config:
            self.configStr = config.read()

    def __parseConfig(self, configStr: str) -> OrderedDict:
        try:
            return json.JSONDecoder(object_pairs_hook=OrderedDict).decode(configStr)
        except:
            return None

    def __buildConfig(self) -> None:
        config = OrderedDict()
        for paper in self.papers:
            vertex = config
            for folder in paper.folders:
                if folder not in vertex:
                    vertex[folder] = OrderedDict()
                
                vertex = vertex[folder]

            vertex[paper.fileName] = paper.htmlName

        self.configStr = json.dumps(config, ensure_ascii=False, indent=2)

    def __parsePapers(self, config: OrderedDict) -> list[Paper]:
        parsedPapers = []

        def dfs(vertex: OrderedDict, path: list[str]) -> None:
            for name, item in vertex.items():
                if isinstance(item, str):
                    parsedPapers.append(Paper(folders=path, fileName=name, htmlName=item))
                else:
                    dfs(item, path + [name])

        dfs(config, [])
        return parsedPapers

    def __loadPapers(self, initialization: bool) -> None:
        self.__readConfig()
        parsedConfig = self.__parseConfig(self.configStr)
        self.papers = self.__parsePapers(parsedConfig)
        if initialization:
            for paper in self.papers:
                self.compileMtex(paper.htmlName, self.getMtexSource(paper.htmlName))

    def __updatePapers(self, newPapers: list[Paper]) -> None:
        for paper in self.papers:
            if paper not in newPapers:
                paper.delete(self.storagePath)

        for paper in newPapers:
            if paper not in self.papers:
                paper.create(self.storagePath)

        self.papers = newPapers

    def __insertNewPaper(self, paper: Paper) -> None:
        position = 0
        maxLca = 0
        for i, obj in enumerate(self.papers):
            lca = obj.lca(paper)
            if lca >= maxLca:
                maxLca = lca
                position = i + 1
        
        self.papers.insert(position, paper)

    def __dumpConfig(self) -> None:
        self.__buildConfig()
        with open(self.configPath, 'w') as configFile:
            configFile.write(self.configStr)
