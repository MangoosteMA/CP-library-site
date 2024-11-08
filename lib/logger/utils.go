package logger

func levelString(level int) string {
	switch level {
	case LOG_LEVEL_DEBUG:
		return "[DEBUG]"
	case LOG_LEVEL_INFO:
		return "[INFO]"
	case LOG_LEVEL_WARN:
		return "[WARN]"
	case LOG_LEVEL_ERROR:
		return "[ERROR]"
	default:
		return ""
	}
}

func logPrint(level int, format string, value ...any) {
	if logLevel <= level {
		log.Printf(levelString(level)+" "+format, value...)
	}
}
