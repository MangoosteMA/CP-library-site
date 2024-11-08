package html_builder

type Edge struct {
	Rule Wrapper
	Dest *HTMLBuilder
}

type HTMLBuilder struct {
	InnerText string
	edges     []Edge
}

func NewHTMLBuilder() *HTMLBuilder {
	return &HTMLBuilder{
		InnerText: "",
		edges:     nil,
	}
}

func (builder *HTMLBuilder) AddEdge(wrapper Wrapper) *HTMLBuilder {
	dest := NewHTMLBuilder()
	builder.edges = append(builder.edges, Edge{
		Rule: wrapper,
		Dest: dest,
	})
	return dest
}

func (builder *HTMLBuilder) AppendChild(child *HTMLBuilder) {
	builder.edges = append(builder.edges, Edge{
		Rule: Wrapper{"", ""},
		Dest: child,
	})
}

func (builder *HTMLBuilder) Compile() string {
	html := builder.InnerText
	for _, node := range builder.edges {
		html += node.Rule.Header
		html += node.Dest.Compile()
		html += node.Rule.Footer
	}
	return html
}
