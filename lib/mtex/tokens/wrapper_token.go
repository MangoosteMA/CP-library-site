package mtex_tokens

import "cp-library-site/lib/html_builder"

/*
Structure:
<{elementType} {**args}>
	...
</{elementType}>
*/

type WrapperToken struct {
	elementType string
	args        *map[string]string
}

func (token *WrapperToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()
	root.AddEdge(html_builder.NewELementWrapper(token.elementType, token.args)).AppendChild(builder)
	return root
}
