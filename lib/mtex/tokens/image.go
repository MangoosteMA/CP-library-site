package mtex_tokens

import (
	"fmt"

	"cp-library-site/lib/html_builder"
)

const (
	IMAGE_TOKEN   = "image"
	IMAGE_ELEMENT = "library-image"
)

/*
Arguments:
name string: name of the image file

Structure:
<img src="{args["name"]}" class="{IMAGE_ELEMENT}">
*/

type ImageToken struct {
	name string
}

func NewImageToken(args *map[string]string) IToken {
	return &ImageToken{
		name: getArgument("name", args, "undefined"),
	}
}

func (token *ImageToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()
	root.AddEdge(html_builder.Wrapper{
		Header: fmt.Sprintf("<img src=\"%s\" class=\"%s\">", token.name, IMAGE_ELEMENT),
	})
	return root
}
