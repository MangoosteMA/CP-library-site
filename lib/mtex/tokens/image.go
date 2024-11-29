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
name   string: name of the image file
width  string: width of the image ("auto" by default)
height string: height of the image ("auto" by default)

Structure:
<img src="{args["name"]}" style="width: {args["width"]}px; height: {args["height"]}px;" class="{IMAGE_ELEMENT}">
*/

type ImageToken struct {
	name   string
	width  string
	height string
}

func NewImageToken(args *map[string]string) IToken {
	return &ImageToken{
		name:   getArgument("name", args, "undefined"),
		width:  getArgument("width", args, "auto"),
		height: getArgument("height", args, "auto"),
	}
}

func (token *ImageToken) Apply(builder *html_builder.HTMLBuilder) *html_builder.HTMLBuilder {
	root := html_builder.NewHTMLBuilder()
	root.AddEdge(html_builder.Wrapper{
		Header: fmt.Sprintf("<img src=\"%s\" style=\"width: %s; height: %s;\" class=\"%s\">",
			token.name, token.width, token.height, IMAGE_ELEMENT),
	})
	return root
}
