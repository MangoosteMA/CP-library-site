from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, FixedHtmlItem

class ItemToken(TokenInterface):
    def __init__(self, parameters: dict[str, str]):
        self.data = None

    @staticmethod
    def getTokenName() -> str:
        return 'item'

    def setData(self, data: str):
        print('Set data', data)
        self.data = data

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        root = HtmlBuilder()
        print('Aboba', self.data)
        root.addEdge(FixedHtmlItem(header=f'{self.data} '))
        root.addEdge(FixedHtmlItem(), destNode=htmlBuilder)
        root.addEdge(FixedHtmlItem()).innerHtml = '<br>'
        return root
