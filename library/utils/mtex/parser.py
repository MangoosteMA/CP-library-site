from .preprocessor      import MtexPreprocessor
from .tokenizer         import MtexTokenizer
from .tokens            import ItemToken, ListTokenInterface, TextToken
from library.utils.html import HtmlBuilder, FixedHtmlItem

class MtexParser:
    def __init__(self, textData: str):
        self.preprocessor = MtexPreprocessor(textData)

    def compileHtml(self) -> HtmlBuilder:
        tokenizer = MtexTokenizer(self.preprocessor.processInput())

        def compileDfs(parentTokenClass=None) -> HtmlBuilder:
            if parentTokenClass == TextToken:
                return None

            childId = 0
            root = HtmlBuilder()
            while True:
                token = tokenizer.nextToken()
                if token is None:
                    break

                childHtml = compileDfs(type(token))
                if parentTokenClass is not None and issubclass(parentTokenClass, ListTokenInterface):
                    if not isinstance(token, ItemToken):
                        continue
                    parentTokenClass.setIdForItem(token, childId)

                root.addEdge(FixedHtmlItem(nextLineAvailable=False), destNode=token.apply(childHtml))
                childId += 1

            return root

        return compileDfs()
