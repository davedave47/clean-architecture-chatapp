package repository

import (
	"root/internal/domain/entities"
	"root/pkg/databases/neo4j"
)

type FriendRepository struct {
	neo4j *neo4j.Database
}

func NewFriendRepo(neo4j *neo4j.Database) *FriendRepository {
	return &FriendRepository{
		neo4j: neo4j,
	}
}

func (repo *FriendRepository) CreateFriend(userId1 string, friendId string) error {
	_, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId1}), (u2:User {id: $friendId})
			CREATE (u1)-[:FRIEND]->(u2)`,
		map[string]interface{}{
			"userId1":  userId1,
			"friendId": friendId,
		})
	return err
}

func (repo *FriendRepository) CheckFriend(userId string, friendId string) (bool, error) {
	records, err := repo.neo4j.Query(
		`MATCH (user1:User {id: $userId})-[r:FRIEND_OF]-(user2:User {id: $friendId})
			RETURN COUNT(r) > 0 AS friends`,
		map[string]interface{}{
			"userId":   userId,
			"friendId": friendId,
		})
	if err != nil {
		return false, err
	}
	return records[0].AsMap()["friends"].(bool), nil
}

func (repo *FriendRepository) GetFriends(userId string) ([]*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId})-[:FRIEND]-(u2:User)
			RETURN u2 AS u`,
		map[string]interface{}{
			"userId": userId,
		})
	if err != nil {
		return nil, err
	}
	users := make([]*entities.User, len(records))
	for index, record := range records {
		users[index], err = RecordToUser(record)
		if err != nil {
			return nil, err
		}
	}
	return users, nil
}

func (repo *FriendRepository) DeleteFriend(userId string, friendId string) error {
	_, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId})-[r:FRIEND]-(u2:User {id: $friendId})
			DELETE r`,
		map[string]interface{}{
			"userId":   userId,
			"friendId": friendId,
		})
	return err
}

func (repo *FriendRepository) RequestFriend(userId string, friendId string) error {
	_, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId}), (u2:User {id: $friendId})
			CREATE (u1)-[:REQUEST]->(u2)`,
		map[string]interface{}{
			"userId":   userId,
			"friendId": friendId,
		})
	return err
}

func (repo *FriendRepository) RejectFriendRequest(userId string, friendId string) error {
	_, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId})-[r:REQUEST]-(u2:User {id: $friendId})
			DELETE r`,
		map[string]interface{}{
			"userId":   userId,
			"friendId": friendId,
		})
	return err
}

func (repo *FriendRepository) GetSentFriendRequests(userId string) ([]*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId})-[:REQUEST]->(u2:User)
			RETURN u2 AS u`,
		map[string]interface{}{
			"userId": userId,
		})
	if err != nil {
		return nil, err
	}
	users := make([]*entities.User, len(records))
	for index, record := range records {
		users[index], err = RecordToUser(record)
		if err != nil {
			return nil, err
		}
	}
	return users, nil
}

func (repo *FriendRepository) GetReceivedFriendRequests(userId string) ([]*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u1:User {id: $userId})<-[:REQUEST]-(u2:User)
			RETURN u2 AS u`,
		map[string]interface{}{
			"userId": userId,
		})
	if err != nil {
		return nil, err
	}
	users := make([]*entities.User, len(records))
	for index, record := range records {
		users[index], err = RecordToUser(record)
		if err != nil {
			return nil, err
		}
	}
	return users, nil
}
