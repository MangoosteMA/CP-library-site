from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, FixedHtmlItem

'''
Structure:
${insideData}$
'''

class MathToken(TokenInterface):
    HEADER = '$'
    FOOTER = '$'
    NEXT_LINE_AVAILABLE = False

    def __init__(self, parameters: dict[str, str]):
        pass

    @staticmethod
    def getTokenName() -> str:
        return 'math'

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        root = HtmlBuilder()
        root.addEdge(FixedHtmlItem(MathToken.HEADER, MathToken.FOOTER, MathToken.NEXT_LINE_AVAILABLE), destNode=htmlBuilder)
        return root
