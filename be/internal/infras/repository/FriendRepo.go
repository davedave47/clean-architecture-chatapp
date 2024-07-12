package repository

import (
	"root/internal/domain/entities"
	databases "root/internal/infras/db"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// type FriendRepository interface {
// 	CreateFriend(userId1 string, friendId string) error
// 	CheckFriend(userId string, friendId string) (bool, error)
// 	GetFriends(userId string) ([]entities.User, error)
// 	DeleteFriend(userId string, friendId string) error
// 	RequestFriend(userId string, friendId string) error
// 	RejectFriendRequest(userId string, friendId string) error
// 	GetSentFriendRequests(userId string) ([]entities.User, error)
// 	GetReceivedFriendRequests(userId string) ([]entities.User, error)
// }

type FriendRepository struct {
	neo4j *databases.Neo4jDatabase
}

func NewFriendRepo(neo4j *databases.Neo4jDatabase) *FriendRepository {
	return &FriendRepository{
		neo4j: neo4j,
	}
}

func (repo *FriendRepository) CreateFriend(userId1 string, friendId string) error {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId1}), (u2:User {id: $friendId})
			CREATE (u1)-[:FRIEND]->(u2)`,
			map[string]interface{}{
				"userId1":  userId1,
				"friendId": friendId,
			},
		)
		return result, err
	})
	return err
}

func (repo *FriendRepository) CheckFriend(userId string, friendId string) (bool, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (user1:User {id: $userId})-[r:FRIEND_OF]-(user2:User {id: $friendId})
			RETURN COUNT(r) > 0 AS friends`,
			map[string]interface{}{
				"userId":   userId,
				"friendId": friendId,
			},
		)
		if err != nil {
			return nil, err
		}
		friends, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		return friends.AsMap()["friends"], nil
	})
	if err != nil {
		return false, err
	}
	return result.(bool), nil
}

func (repo *FriendRepository) GetFriends(userId string) ([]entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	users, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		users, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId})-[:FRIEND]-(u2:User)
			RETURN u2 AS u`,
			map[string]interface{}{
				"userId": userId,
			},
		)
		if err != nil {
			return nil, err
		}
		records, err := users.Collect(ctx)
		if err != nil {
			return nil, err
		}
		friends := make([]entities.User, 0)
		for index, record := range records {
			friends[index] = RecordToUser(record)
		}
		return friends, nil
	})
	if err != nil {
		return nil, err
	}
	usersEntity, ok := users.([]entities.User)
	if !ok {
		return nil, err
	}
	return usersEntity, nil
}

func (repo *FriendRepository) DeleteFriend(userId string, friendId string) error {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId})-[r:FRIEND]-(u2:User {id: $friendId})
			DELETE r`,
			map[string]interface{}{
				"userId":   userId,
				"friendId": friendId,
			},
		)
		return result, err
	})
	return err
}

func (repo *FriendRepository) RequestFriend(userId string, friendId string) error {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId}), (u2:User {id: $friendId})
			CREATE (u1)-[:REQUEST]->(u2)`,
			map[string]interface{}{
				"userId":   userId,
				"friendId": friendId,
			},
		)
		return result, err
	})
	return err
}

func (repo *FriendRepository) RejectFriendRequest(userId string, friendId string) error {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId})-[r:REQUEST]-(u2:User {id: $friendId})
			DELETE r`,
			map[string]interface{}{
				"userId":   userId,
				"friendId": friendId,
			},
		)
		return result, err
	})
	return err
}

func (repo *FriendRepository) GetSentFriendRequests(userId string) ([]entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	users, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId})-[:REQUEST]->(u2:User)
			RETURN u2 AS u`,
			map[string]interface{}{
				"userId": userId,
			})
		if err != nil {
			return nil, err
		}
		records, err := result.Collect(ctx)
		if err != nil {
			return nil, err
		}
		users := make([]entities.User, 0)
		for index, record := range records {
			users[index] = RecordToUser(record)
		}
		return users, nil
	})
	if err != nil {
		return nil, err

	}
	return users.([]entities.User), nil
}

func (repo *FriendRepository) GetReceivedFriendRequests(userId string) ([]entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()
	users, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u1:User {id: $userId})<-[:REQUEST]-(u2:User)
			RETURN u2 AS u`,
			map[string]interface{}{
				"userId": userId,
			},
		)
		if err != nil {
			return nil, err
		}
		records, err := result.Collect(ctx)
		if err != nil {
			return nil, err
		}
		users := make([]entities.User, 0)
		for index, record := range records {
			users[index] = RecordToUser(record)
		}
		return users, nil
	})
	if err != nil {
		return nil, err
	}
	return users.([]entities.User), nil
}
