package databases

import (
	"root/pkg/databases/mongodb"
	"root/pkg/databases/neo4j"
	"root/pkg/databases/redis"
)

var UserDB *neo4j.Database
var MessageDB *mongodb.Database
var SocketDB *redis.Database
