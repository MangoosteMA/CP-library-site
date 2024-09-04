from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<ol> {insideData} </ol>
'''

class EnumerateToken(BaseHtmlItemWrapperToken):
    def __init__(self, parameters: dict[str, str]):
        super().__init__('ol', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'enumerate'
