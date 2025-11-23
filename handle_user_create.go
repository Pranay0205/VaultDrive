package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Pranay0205/VaultDrive/auth"
	"github.com/Pranay0205/VaultDrive/internal/database"
)

func (cfg *ApiConfig) registerUserHandler(w http.ResponseWriter, r *http.Request) {
	var newUser struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
		Email     string `json:"email"`
		Password  string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	hashedPassword, err := auth.HashPassword(newUser.Password)
	if err != nil {
		log.Printf("Error retrieving user: %v", err)
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	user, err := cfg.dbQueries.CreateUser(context.Background(), database.CreateUserParams{
		FirstName:           newUser.FirstName,
		LastName:            newUser.LastName,
		Username:            newUser.Username,
		Email:               newUser.Email,
		PasswordHash:        hashedPassword,
		PublicKey:           "temp_key",
		PrivateKeyEncrypted: "temp_encrypted",
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	})

	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"user_id": user.ID, "message": "User created successfully"})
}
