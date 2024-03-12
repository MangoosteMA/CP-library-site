from .item_token           import ItemToken
from .list_token_interface import ListTokenInterface
from .token_interface      import TokenInterface
from library.utils.html    import HtmlBuilder

class EnumerateToken(TokenInterface, ListTokenInterface):
    def __init__(self, parameters: dict[str, str]):
        pass

    @staticmethod
    def getTokenName() -> str:
        return 'enumerate'

    @staticmethod
    def setIdForItem(item: ItemToken, index: int) -> str:
        item.setData(f'<b>{index + 1}.</b>')

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        return htmlBuilder
