package mtex_tokens

import "cp-library-site/lib/html_builder"

type IToken interface {
	Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder
}
