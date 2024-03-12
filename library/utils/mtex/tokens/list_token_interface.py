from .item_token        import ItemToken
from library.utils.html import HtmlBuilder
from abc                import ABC, abstractmethod

class ListTokenInterface(ABC):
    @staticmethod
    @abstractmethod
    def setIdForItem(item: ItemToken, index: int) -> str:
        pass
