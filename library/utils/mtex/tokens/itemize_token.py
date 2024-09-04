from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<ul> {insideData} </ul>
'''

class ItemizeToken(BaseHtmlItemWrapperToken):
    def __init__(self, parameters: dict[str, str]):
        super().__init__('ul', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'itemize'
