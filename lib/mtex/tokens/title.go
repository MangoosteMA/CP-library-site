package mtex_tokens

import (
	"fmt"

	"cp-library-site/lib/html_builder"
)

const (
	TITLE_TOKEN = "title"
	TITLE_DIV   = "library-title-div"
)

/*
Structure:
<script type="text/javascript">
    document.title = ...;
<\script>
<div class={TITLE_DIV}>
	...
</div>
*/

type TitleToken struct{}

func NewTitleToken() IToken {
	return &TitleToken{}
}

func (token *TitleToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()

	root.AddEdge(html_builder.NewELementWrapper("script", &map[string]string{
		"type": "text/javascript",
	})).InnerText = fmt.Sprintf("document.title = \"%s\"", builder.Compile())

	root.AddEdge(html_builder.NewELementWrapper("div", &map[string]string{
		"class": TITLE_DIV,
	})).AppendChild(builder)

	return root
}
