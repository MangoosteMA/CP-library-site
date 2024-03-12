from .html_rule_interface import HtmlRuleInterface

class FixedHtmlItem(HtmlRuleInterface):
    def __init__(self, header: str = '', footer: str = '', nextLineAvailable: bool = False):
        self.header = header
        self.footer = footer
        self.nextLineAvailable = nextLineAvailable

    def nextLineAfterHeaderAvailable(self) -> bool:
        return self.nextLineAvailable

    def buildHeader(self, parameters: dict[str, str]) -> str:
        return self.header

    def buildFooter(self, parameters: dict[str, str]) -> str:
        return self.footer
