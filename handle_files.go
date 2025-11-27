package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Pranay0205/VaultDrive/auth"
	"github.com/Pranay0205/VaultDrive/internal/database"
	"github.com/google/uuid"
)

func (cfg *ApiConfig) handlerCreateFiles(w http.ResponseWriter, r *http.Request) {

	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Missing or invalid token", err)
		return
	}

	ownerID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid token", err)
		return
	}

	type uploadFileRequest struct {
		FileName string `json:"file_name"`
		FilePath string `json:"file_path"`
		Size     int64  `json:"size"`
	}

	var fileRequest uploadFileRequest
	err = json.NewDecoder(r.Body).Decode(&fileRequest)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	dbfile, err := cfg.dbQueries.CreateFile(r.Context(), database.CreateFileParams{
		OwnerID:           uuid.NullUUID{UUID: ownerID, Valid: true},
		Filename:          fileRequest.FileName,
		FilePath:          fileRequest.FilePath,
		FileSize:          fileRequest.Size,
		EncryptedMetadata: sql.NullString{},
		CurrentKeyVersion: sql.NullInt32{},
		CreatedAt:         sql.NullTime{Time: time.Now().UTC(), Valid: true},
		UpdatedAt:         sql.NullTime{Time: time.Now().UTC(), Valid: true},
	})

	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Could not create file entry", err)
		return
	}

	respondWithJSON(w, http.StatusAccepted, map[string]interface{}{
		"file_name":  dbfile.Filename,
		"file_path":  dbfile.FilePath,
		"file_id":    dbfile.ID,
		"owner_id":   dbfile.OwnerID,
		"created_at": dbfile.CreatedAt,
		"updated_at": dbfile.UpdatedAt,
	})

}
