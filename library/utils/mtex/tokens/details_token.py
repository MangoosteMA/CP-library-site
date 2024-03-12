from .tab_zone_token    import TabZoneToken
from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, BaseHtmlItem

'''
Sructure:
<details class={self.mode}-{DETAILS}>
    <summary class={self.mode}-{SUMMARY}>{self.summary}</summary>
    <div class={TabZoneToken.MAIN_DIV}>
        {insideData}
    </div>
</details>
'''

class DetailsToken(TokenInterface):
    DETAILS = 'details'
    SUMMARY = 'summary'

    def __init__(self, parameters: dict[str, str]):
        self.summary = parameters.get('summary', '')
        self.mode = parameters.get('mode', 'simple')

    @staticmethod
    def getTokenName() -> str:
        return 'details'

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        root = HtmlBuilder().addEdge(BaseHtmlItem('details'), className=f'{self.mode}-{DetailsToken.DETAILS}')
        root.addEdge(BaseHtmlItem('summary'), className=f'{self.mode}-{DetailsToken.SUMMARY}').innerHtml = self.summary
        root.addEdge(BaseHtmlItem('div'), destNode=htmlBuilder, className=TabZoneToken.MAIN_DIV)
        return root.parent
