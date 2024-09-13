from __future__  import annotations

from library.utils.mtex import MtexParser

from dataclasses import dataclass
import os

EXTENTIONS = ['html', 'mtex']

@dataclass
class Paper:
    folders:  list[str]
    fileName: str
    htmlName: str

    def fullPath(self, prefix: str) -> str:
        return prefix + '/' + self.htmlName

    def delete(self, prefix: str) -> None:
        for extension in EXTENTIONS:
            os.remove(f'{self.fullPath(prefix)}.{extension}')

    def create(self, prefix: str) -> None:
        for extension in EXTENTIONS:
            with open(f'{self.fullPath(prefix)}.{extension}', 'w') as newFile:
                newFile.write('')

    def compileMtex(self, prefix: str, mtexCode: str) -> None:
        with open(self.fullPath(prefix) + '.mtex', 'w') as mtexFile:
            mtexFile.write(mtexCode)

        parser = MtexParser(mtexCode)
        html = parser.compileHtml().htmlToStr()

        with open(self.fullPath(prefix) + '.html', 'w') as htmlFile:
            htmlFile.write(html)

    def lca(self, paper: Paper) -> int:
        lca = 0
        while lca < min(len(self.folders), len(paper.folders)) and self.folders[lca] == paper.folders[lca]:
            lca += 1

        return lca

    def isDraft(self) -> bool:
        return self.htmlName.endswith('-draft')

    def __eq__(self, other: Paper) -> bool:
        return self.folders  == other.folders  and\
               self.fileName == other.fileName and\
               self.htmlName == other.htmlName
