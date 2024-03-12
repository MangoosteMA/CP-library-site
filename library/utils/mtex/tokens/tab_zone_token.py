from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<div class={MAIN_DIV}>
    {insideDiv}
</div>
'''

class TabZoneToken(BaseHtmlItemWrapperToken):
    MAIN_DIV = 'add-tab-div'

    def __init__(self, parameters: dict[str, str]):
        parameters['className'] = TabZoneToken.MAIN_DIV
        super().__init__('div', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'tabZone'
