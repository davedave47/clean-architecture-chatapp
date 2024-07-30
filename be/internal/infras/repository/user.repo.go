package repository

import (
	"fmt"
	"root/internal/domain/entities"
	databases "root/internal/infras/db"
)

func RecordToUser(record databases.Record) (*entities.User, error) {
	usernode, err := databases.GetNode(record, "u")
	if err != nil {
		return nil, err
	}
	return &entities.User{
		ID:       usernode.Props["id"].(string),
		Username: usernode.Props["name"].(string),
		Email:    usernode.Props["email"].(string),
	}, nil
}

type UserRepository struct {
	neo4j *databases.Neo4jDatabase
}

func NewUserRepo(neo4j *databases.Neo4jDatabase) *UserRepository {
	return &UserRepository{
		neo4j: neo4j,
	}
}

func (repo *UserRepository) CreateUser(name string, email string, password string) (*entities.User, error) {
	records, err := repo.neo4j.Query(`CREATE (u:User {name: $name, email: $email, password: $password, id: randomUUID()}) RETURN u`,
		map[string]interface{}{
			"name":     name,
			"email":    email,
			"password": password,
		})
	if err != nil {
		return nil, err
	}
	return RecordToUser(records[0])
}

func (repo *UserRepository) GetUserByEmail(email string) (*entities.User, string, error) {
	records, err := repo.neo4j.Query(`MATCH (u:User {email: $email}) RETURN u`,
		map[string]interface{}{
			"email": email,
		})
	if err != nil {
		return nil, "", err
	}
	if len(records) == 0 {
		return nil, "", fmt.Errorf("user not found")
	}
	userNode, err := databases.GetNode(records[0], "u")
	if err != nil {
		return nil, "", err
	}
	return &entities.User{
		ID:       userNode.Props["id"].(string),
		Username: userNode.Props["name"].(string),
		Email:    userNode.Props["email"].(string),
	}, userNode.Props["password"].(string), nil
}

func (repo *UserRepository) GetAllUsers() ([]*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u:User) RETURN u`, nil)
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

func (repo *UserRepository) GetUserById(id string) (*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u:User {id: $id}) RETURN u`,
		map[string]interface{}{
			"id": id,
		})
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("user not found")
	}
	return RecordToUser(records[0])
}

func (repo *UserRepository) UpdateUser(id string, changes *entities.UserChanges) (*entities.User, error) {
	changesMap := make(map[string]interface{}) // Initialize the map
	if changes.Email != "" {
		changesMap["email"] = changes.Email
	}
	if changes.Username != "" {
		changesMap["name"] = changes.Username
	}
	records, err := repo.neo4j.Query(`MATCH (u:User {id: $id}) SET u += $changes RETURN u`,
		map[string]interface{}{
			"id":      id,
			"changes": changesMap,
		})
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("user not found")
	}
	return RecordToUser(records[0])
}

func (repo *UserRepository) UpdatePassword(id string, password string) (*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (u:User {id: $id}) SET u.password = $password RETURN u`,
		map[string]interface{}{
			"id":       id,
			"password": password,
		})
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("user not found")
	}
	return RecordToUser(records[0])
}

func (repo *UserRepository) DeleteUser(id string) error {
	_, err := repo.neo4j.Query(`MATCH (u:User {id: $id}) DETACH DELETE u`,
		map[string]interface{}{
			"id": id,
		})
	return err
}

func (repo *UserRepository) GetUserByName(name string) ([]*entities.User, error) {
	records, err := repo.neo4j.Query(`MATCH (user:User)
            WHERE user.name <> 'admin'
            AND (toLower(user.name) = toLower($name) 
            OR toLower(user.name) STARTS WITH toLower($name) 
            OR toLower(user.name) CONTAINS toLower(' ' + $name) 
            OR toLower(user.name) CONTAINS toLower($name))
            RETURN user AS u, 
            CASE 
                WHEN toLower(user.name) = toLower($name) THEN 1
                WHEN toLower(user.name) STARTS WITH toLower($name) THEN 2
                WHEN toLower(user.name) CONTAINS toLower(' ' + $name) THEN 2
                WHEN toLower(user.name) CONTAINS toLower($name) THEN 3
            END as priority
            ORDER BY priority`,
		map[string]interface{}{
			"name": name,
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
