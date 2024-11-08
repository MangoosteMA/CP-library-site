package mtex_tokens

const ITEM_TOKEN = "item"

/*
Structure:
<li> ... </li>
*/

func NewItemToken() IToken {
	return &WrapperToken{
		elementType: "li",
		args:        nil,
	}
}
