package mtex_tokens

const ENUMERATE_TOKEN = "enumerate"

/*
Structure:
<ol> ... </ol>
*/

func NewEnumerateToken() IToken {
	return &WrapperToken{
		elementType: "ol",
		args:        nil,
	}
}
