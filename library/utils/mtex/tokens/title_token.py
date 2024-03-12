from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, BaseHtmlItem

'''
Structure:
<script type={JS_TYPE}>
    document.title = {insideData};
<\script>
<div class={MAIN_DIV}>
    {insideData}
</div>
'''

class TitleToken(TokenInterface):
    MAIN_DIV = 'library-title-div'
    JS_TYPE  = 'text/javascript'

    def __init__(self, parameters: dict[str, str]):
        pass

    @staticmethod
    def getTokenName() -> str:
        return 'title'

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        root = HtmlBuilder()
        insideData = htmlBuilder.htmlToStr().strip()
        root.addEdge(BaseHtmlItem('script'), type=TitleToken.JS_TYPE).innerHtml = f'document.title = \"{insideData}\";'
        root.addEdge(BaseHtmlItem('div'), destNode=htmlBuilder, className=TitleToken.MAIN_DIV)
        return root
