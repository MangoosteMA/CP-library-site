from library.utils.html import HtmlBuilder
from abc                import ABC, abstractmethod

class TokenInterface(ABC):
    @abstractmethod
    def __init__(self, parameters: dict[str, str]):
        pass

    @staticmethod
    @abstractmethod
    def getTokenName() -> str:
        pass

    @abstractmethod
    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        pass
