package mtex_tokens

const ITEMIZE_TOKEN = "itemize"

/*
Structure:
<ul> ... </ul>
*/

func NewItemizeToken() IToken {
	return &WrapperToken{
		elementType: "ul",
		args:        nil,
	}
}
