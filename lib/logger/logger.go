package logger

import (
	"fmt"
	base_log "log"
	"os"

	"cp-library-site/lib/config"
)

const (
	LOG_LEVEL_DEBUG = 0
	LOG_LEVEL_INFO  = 1
	LOG_LEVEL_WARN  = 2
	LOG_LEVEL_ERROR = 3
)

var (
	logLevel = LOG_LEVEL_DEBUG
	log      = base_log.New(os.Stdout, "", base_log.Ldate|base_log.Ltime)
	logErr   = base_log.New(os.Stderr, "", base_log.Ldate|base_log.Ltime)
)

func Debug(format string, value ...any) {
	logPrint(LOG_LEVEL_DEBUG, format, value...)
}

func Info(format string, value ...any) {
	logPrint(LOG_LEVEL_INFO, format, value...)
}

func Warn(format string, value ...any) {
	logPrint(LOG_LEVEL_WARN, format, value...)
}

func Error(format string, value ...any) error {
	logPrint(LOG_LEVEL_ERROR, format, value...)
	logErr.Printf(format, value...)
	return fmt.Errorf(format, value...)
}

func InitLogger(config *config.TConfig) {
	logLevel = config.LogLevel

	var logFile, logErrFile *os.File

	if len(config.LogPath) == 0 {
		logFile = os.Stdout
		logErrFile = os.Stderr
	} else {
		var err error
		logFile, err = os.OpenFile(config.LogPath+".log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0660)
		if err != nil {
			panic(err)
		}

		logErrFile, err = os.OpenFile(config.LogPath+".err", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0660)
		if err != nil {
			panic(err)
		}
	}

	flags := base_log.Ldate | base_log.Ltime
	log = base_log.New(logFile, "", flags)
	logErr = base_log.New(logErrFile, "", flags)

	Info("Logger is successfully initialized")
}
