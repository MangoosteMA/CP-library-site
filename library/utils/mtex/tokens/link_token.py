from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<a class={MAIN_LINK} href={href} target={TARGET}>
    {insideData}
</a>
'''

'''
Presets:
href
'''

class LinkToken(BaseHtmlItemWrapperToken):
    MAIN_LINK = 'link'
    TARGET = '_blank'

    def __init__(self, parameters: dict[str, str]):
        parameters['className'] = LinkToken.MAIN_LINK
        parameters['target'] = LinkToken.TARGET
        super().__init__('a', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'link'
