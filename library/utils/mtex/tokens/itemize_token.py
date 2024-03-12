from .item_token           import ItemToken
from .list_token_interface import ListTokenInterface
from .token_interface      import TokenInterface
from library.utils.html    import HtmlBuilder

class ItemizeToken(TokenInterface, ListTokenInterface):
    def __init__(self, parameters: dict[str, str]):
        pass

    @staticmethod
    def getTokenName() -> str:
        return 'itemize'

    @staticmethod
    def setIdForItem(item: ItemToken, index: int) -> str:
        item.setData('&#9679;')

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        return htmlBuilder
