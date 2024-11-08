package mtex

func Compile(source string) string {
	source = applyDefines(source)
	builder := compileDfs(source, false)
	return builder.Compile()
}
