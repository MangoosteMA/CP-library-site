from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, BaseHtmlItem

'''
structure:
<{self.htmlClass} {parameters}>
    {insideDiv}
</{self.htmlClass}>
'''

class BaseHtmlItemWrapperToken(TokenInterface):
    def __init__(self, htmlClass, parameters: dict[str, str]):
        self.htmlClass = htmlClass
        self.parameters = parameters

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        root = HtmlBuilder()
        root.addEdge(BaseHtmlItem(self.htmlClass), destNode=htmlBuilder, **self.parameters)
        return root
