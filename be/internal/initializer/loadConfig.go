package initializer

import (
	"fmt"

	"root/config"

	"github.com/spf13/viper"
)

func loadConfig() {

	viper.AddConfigPath("./config")
	viper.SetConfigName("local")
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		panic(fmt.Errorf("fatal error config file: %s", err))
	}

	if err := viper.Unmarshal(&config.Config); err != nil {
		panic(fmt.Errorf("fatal error config file: %s", err))
	}
}
