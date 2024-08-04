package config

import (
	"root/pkg/databases/mongodb"
	"root/pkg/databases/neo4j"
	"root/pkg/databases/redis"
)

var Config struct {
	Server struct {
		Port string `mapstructure:"port"`
		SSL  struct {
			KeyPath  string `mapstructure:"key_path"`
			CertPath string `mapstructure:"cert_path"`
		} `mapstructure:"ssl"`
		Auth struct {
			JwtSecret string `mapstructure:"jwt_secret"`
			AdminID   string `mapstructure:"admin_id"`
		} `mapstructure:"auth"`
		Cors struct {
			Origin string `mapstructure:"origin"`
		} `mapstructure:"cors"`
	} `mapstructure:"server"`
	Database struct {
		Neo4j neo4j.Config   `mapstructure:"neo4j"`
		Mongo mongodb.Config `mapstructure:"mongo"`
		Redis redis.Config   `mapstructure:"redis"`
	} `mapstructure:"databases"`
}
