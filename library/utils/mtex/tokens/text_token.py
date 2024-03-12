from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder

class TextToken(TokenInterface):
    def __init__(self, text: str):
        self.text = text

    @staticmethod
    def getTokenName() -> str:
        return None

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        assert htmlBuilder is None, 'Text token should not have dependences.'
        root = HtmlBuilder()
        root.innerHtml = self.text
        return root
