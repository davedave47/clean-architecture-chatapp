package repository

import (
	"root/internal/domain/entities"
	databases "root/internal/infras/db"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j/db"
)

type UserRepository struct {
	neo4j *databases.Neo4jDatabase
}

func NewUserRepo(neo4j *databases.Neo4jDatabase) *UserRepository {
	return &UserRepository{
		neo4j: neo4j,
	}
}

func (repo *UserRepository) CreateUser(name string, email string, password string) (*entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	user, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`CREATE (u:User {name: $name, email: $email, password: $password, id: randomUUID()}) RETURN u`,
			map[string]interface{}{
				"name":     name,
				"email":    email,
				"password": password,
			},
		)
		if err != nil {
			return nil, err
		}
		user, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		usernode, _, err := neo4j.GetRecordValue[neo4j.Node](user, "u")
		if err != nil {
			return nil, err
		}
		return &entities.User{
			ID:       usernode.Props["id"].(string),
			Username: usernode.Props["name"].(string),
			Email:    usernode.Props["email"].(string),
		}, nil
	})
	if err != nil {
		return nil, err

	}
	userEntity, ok := user.(*entities.User)
	if !ok {
		return nil, err
	}
	return userEntity, nil
}

func (repo *UserRepository) GetUserByEmail(email string) (*entities.User, string, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	user, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u:User {email: $email}) RETURN u`,
			map[string]interface{}{
				"email": email,
			},
		)
		if err != nil {
			return nil, err
		}
		user, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		usernode, _, err := neo4j.GetRecordValue[neo4j.Node](user, "u")
		if err != nil {
			return nil, err
		}
		return usernode.Props, nil
	})
	if err != nil {
		return nil, "", err
	}
	userEntity, ok := user.(map[string]interface{})
	if !ok {
		return nil, "", err
	}
	return &entities.User{
		ID:       userEntity["id"].(string),
		Username: userEntity["name"].(string),
		Email:    userEntity["email"].(string),
	}, userEntity["password"].(string), nil
}

func RecordToUser(record *db.Record) entities.User {
	usernode, _, err := neo4j.GetRecordValue[neo4j.Node](record, "u")
	if err != nil {
		return entities.User{}
	}
	return entities.User{
		ID:       usernode.Props["id"].(string),
		Username: usernode.Props["name"].(string),
		Email:    usernode.Props["email"].(string),
	}
}

func (repo *UserRepository) GetAllUsers() ([]entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	users, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u:User) RETURN u`,
			nil,
		)
		if err != nil {
			return nil, err
		}
		records, err := result.Collect(ctx)
		if err != nil {
			return nil, err
		}
		users := make([]entities.User, len(records))
		for index, record := range records {
			users[index] = RecordToUser(record)
		}
		return users, nil
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

func (repo *UserRepository) GetUserById(id string) (*entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	user, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u:User {id: $id}) RETURN u`,
			map[string]interface{}{
				"id": id,
			},
		)
		if err != nil {
			return nil, err
		}
		user, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		userNode, _, err := neo4j.GetRecordValue[neo4j.Node](user, "u")
		if err != nil {
			return nil, err
		}
		return &entities.User{
			ID:       userNode.Props["id"].(string),
			Username: userNode.Props["name"].(string),
			Email:    userNode.Props["email"].(string),
		}, nil
	})
	if err != nil {
		return nil, err
	}
	userEntity, ok := user.(*entities.User)
	if !ok {
		return nil, err
	}
	return userEntity, nil
}

func (repo *UserRepository) UpdateUser(id string, changes *entities.UserChanges) (*entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	user, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {

		changesMap := make(map[string]interface{})
		if changes.Email != "" {
			changesMap["email"] = changes.Email
		}
		if changes.Username != "" {
			changesMap["name"] = changes.Username
		}
		result, err := tx.Run(ctx,
			`MATCH (u:User {id: $id}) SET u += $changes RETURN u`,
			map[string]interface{}{
				"id":      id,
				"changes": changesMap,
			},
		)
		if err != nil {
			return nil, err
		}
		user, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		userNode, _, err := neo4j.GetRecordValue[neo4j.Node](user, "u")
		if err != nil {
			return nil, err
		}
		return &entities.User{
			ID:       userNode.Props["id"].(string),
			Username: userNode.Props["name"].(string),
			Email:    userNode.Props["email"].(string),
		}, nil
	})
	if err != nil {
		return nil, err

	}
	userEntity, ok := user.(*entities.User)
	if !ok {
		return nil, err
	}
	return userEntity, nil
}

func (repo *UserRepository) UpdatePassword(id string, password string) (*entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	user, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (u:User {id: $id}) SET u.password = $password RETURN u`,
			map[string]interface{}{
				"id":       id,
				"password": password,
			},
		)
		if err != nil {
			return nil, err
		}
		user, err := result.Single(ctx)
		if err != nil {
			return nil, err
		}
		userNode, _, err := neo4j.GetRecordValue[neo4j.Node](user, "u")
		if err != nil {
			return nil, err
		}
		return &entities.User{
			ID:       userNode.Props["id"].(string),
			Username: userNode.Props["name"].(string),
			Email:    userNode.Props["email"].(string),
		}, nil
	})
	if err != nil {
		return nil, err

	}
	userEntity, ok := user.(*entities.User)
	if !ok {
		return nil, err

	}
	return userEntity, nil
}

func (repo *UserRepository) DeleteUser(id string) error {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		_, err := tx.Run(ctx,
			`MATCH (u:User {id: $id}) DETACH DELETE u`,
			map[string]interface{}{
				"id": id,
			},
		)
		if err != nil {
			return nil, err
		}
		return nil, nil
	})
	if err != nil {
		return err
	}
	return nil
}

func (repo *UserRepository) GetUserByName(name string) ([]entities.User, error) {
	session, ctx, cleanup := repo.neo4j.NewSession()
	defer cleanup()

	users, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		result, err := tx.Run(ctx,
			`MATCH (user:User)
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
			},
		)
		if err != nil {
			return nil, err
		}
		records, err := result.Collect(ctx)
		if err != nil {
			return nil, err
		}
		users := make([]entities.User, len(records))
		for index, record := range records {
			users[index] = RecordToUser(record)
		}
		return users, nil
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
