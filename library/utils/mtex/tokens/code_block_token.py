from .token_interface   import TokenInterface
from library.utils.html import HtmlBuilder, BaseHtmlItem

import uuid

'''
Structure:
<div class={MAIN_DIV}>
    <div class={NAVIGATION_DIV}>
        <div class={LANGUAGE_DIV}>{self.language}</div>
        <button class={COPY_BUTTON} onclick="{ONCLICK_BUTTON}(uuid)">
            {BUTTON_TEXT}
        </button>
        <img class={CHECK_MARK_IMG} src={CHECK_MARK_SRC} id=uuid>
    </div>
    <pre><code class={self.language} id=uuid>{insideData}</code></pre>
</div>
'''

'''
Presets:
language (C++ by default)
'''

class CodeBlockToken(TokenInterface):
    MAIN_DIV       = 'code-details-div'
    NAVIGATION_DIV = 'code-navigation-div'
    COPY_BUTTON    = 'copy-code-button'
    ONCLICK_BUTTON = 'copyCode'
    BUTTON_TEXT    = 'Скопировать'
    LANGUAGE_DIV   = 'language-div'
    CHECK_MARK_SRC = '/images/check_mark.png'
    CHECK_MARK_IMG = 'check-mark-image'

    def __init__(self, parameters: dict[str, str]):
        self.language = parameters.get('language', 'C++')

    @staticmethod
    def getTokenName() -> str:
        return 'codeBlock'

    def apply(self, htmlBuilder: HtmlBuilder) -> HtmlBuilder:
        blockId = uuid.uuid4().hex + '.cpp'
        root = HtmlBuilder().addEdge(BaseHtmlItem('div'), className=CodeBlockToken.MAIN_DIV)

        navigation = root.addEdge(BaseHtmlItem('div'), className=CodeBlockToken.NAVIGATION_DIV)
        navigation.addEdge(BaseHtmlItem('div'), className=CodeBlockToken.LANGUAGE_DIV).innerHtml = self.language
        navigation.addEdge(BaseHtmlItem('button'), className=CodeBlockToken.COPY_BUTTON, onclick=f'{CodeBlockToken.ONCLICK_BUTTON}(\'{blockId}\')').innerHtml = CodeBlockToken.BUTTON_TEXT
        navigation.addEdge(BaseHtmlItem('img'), className=CodeBlockToken.CHECK_MARK_IMG, src=CodeBlockToken.CHECK_MARK_SRC, id=f'{blockId}-check-img')

        root.addEdge(BaseHtmlItem('pre'))\
            .addEdge(BaseHtmlItem('code'), destNode=htmlBuilder, className=self.language, id=str(blockId))

        return root.parent
