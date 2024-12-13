package main

import (
	"cp-library-site/contests_parser"
	"cp-library-site/lib/config"
	"cp-library-site/lib/guess_the_code"
	"cp-library-site/lib/logger"
	"cp-library-site/lib/papers"
	"cp-library-site/lib/users"
	"cp-library-site/server"
)

func main() {
	config := config.ReadConfig("config.yaml")

	logger.InitLogger(config)
	papers.InitContainers(config)
	users.InitDB(config)
	contests_parser.Start()
	guess_the_code.InitDB(config)
	server.Start(config)
}
