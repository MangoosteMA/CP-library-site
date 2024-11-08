package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type TPapersConfig struct {
	ConfigPath string `yaml:"ConfigPath"`
	Storage    string `yaml:"Storage"`
}

type TConfig struct {
	Host     string `yaml:"Host"`
	LogPath  string `yaml:"LogPath"`
	LogLevel int    `yaml:"LogLevel"`

	UsersDBPath string `yaml:"UsersDBPath"`

	GinLogPath string `yaml:"GinLogPath"`
	GinSecret  string `yaml:"GinSecret"`

	Algo TPapersConfig `yaml:"Algo"`
	Dev  TPapersConfig `yaml:"Dev"`
}

func ReadConfig(configPath string) *TConfig {
	content, err := os.ReadFile(configPath)
	if err != nil {
		panic(err)
	}

	var config TConfig
	err = yaml.Unmarshal(content, &config)
	if err != nil {
		panic(err)
	}

	return &config
}
