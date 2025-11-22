package main

import (
	"encoding/json"
	"net/http"
)

func (cfg *ApiConfig) registerUserHandler(r http.ResponseWriter, req *http.Request) {
	var newUser struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		Password  string `json:"password"`
	}

	err := json.NewDecoder(req.Body).Decode(&newUser)
	if err != nil {
		http.Error(r, "Invalid request payload", http.StatusBadRequest)
		return
	}
	// To Do : Add user to database
	// value, err := cfg.dbQueries.CreateUser(context.Background(), database.CreateUserParams{})

}
