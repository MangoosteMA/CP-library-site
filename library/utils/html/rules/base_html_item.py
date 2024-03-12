from .html_rule_interface import HtmlRuleInterface

class BaseHtmlItem(HtmlRuleInterface):
    def __init__(self, itemType: str):
        self.itemType = itemType

    def nextLineAfterHeaderAvailable(self) -> bool:
        return self.itemType not in {'img', 'code', 'pre'}

    def buildHeader(self, parameters: dict[str, str]) -> str:
        result = f'<{self.itemType}'
        for name, data in parameters.items():
            if name == 'className':
                name = 'class'
            result += f' {name}=\"{data}\"'
        return result + '>'

    def buildFooter(self, parameters: dict[str, str]) -> str:
        if self.itemType in {'img'}:
            return ''
        return f'</{self.itemType}>'
