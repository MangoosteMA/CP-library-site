from .base_html_item_wrapper_token import BaseHtmlItemWrapperToken

'''
structure:
<li> {insideData} </li>
'''

class ItemToken(BaseHtmlItemWrapperToken):
    def __init__(self, parameters: dict[str, str]):
        super().__init__('li', parameters)

    @staticmethod
    def getTokenName() -> str:
        return 'item'
