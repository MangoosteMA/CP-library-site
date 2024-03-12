from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<div class={MAIN_DIV}>
    {insideData}
</div>
'''

class CenterToken(BaseHtmlItemWrapperToken):
    MAIN_DIV = 'center-align-div'

    def __init__(self, parameters: dict[str, str]):
        parameters['className'] = CenterToken.MAIN_DIV
        super().__init__('div', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'center'
