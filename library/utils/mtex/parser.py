from .preprocessor      import MtexPreprocessor
from .tokenizer         import MtexTokenizer
from .tokens            import ItemToken, TextToken
from library.utils.html import HtmlBuilder, FixedHtmlItem

class MtexParser:
    def __init__(self, textData: str):
        self.preprocessor = MtexPreprocessor(textData)

    def compileHtml(self) -> HtmlBuilder:
        tokenizer = MtexTokenizer(self.preprocessor.processInput())

        def compileDfs(parentTokenClass=None) -> HtmlBuilder:
            if parentTokenClass == TextToken:
                return None

            root = HtmlBuilder()
            while not tokenizer.empty():
                token = tokenizer.nextToken()
                if token is None:
                    break

                childHtml = compileDfs(type(token))
                root.addEdge(FixedHtmlItem(nextLineAvailable=False), destNode=token.apply(childHtml))

            return root

        return compileDfs()
