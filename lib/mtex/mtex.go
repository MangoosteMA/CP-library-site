package mtex

func Compile(source string) string {
	source = rtrimText(source)
	builder := compileDfs(source, false)
	return builder.Compile()
}
