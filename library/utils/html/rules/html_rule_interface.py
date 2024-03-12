from abc import ABC, abstractmethod

class HtmlRuleInterface(ABC):
    @abstractmethod
    def nextLineAfterHeaderAvailable(self) -> bool:
        pass

    @abstractmethod
    def buildHeader(self, parameters: dict[str, str]) -> str:
        pass

    @abstractmethod
    def buildFooter(self, parameters: dict[str, str]) -> str:
        pass
