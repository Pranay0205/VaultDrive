package main

import (
	"net/http"
	"time"

	"github.com/Pranay0205/VaultDrive/auth"
	"github.com/google/uuid"
)

func (cfg *ApiConfig) handlerListFiles(w http.ResponseWriter, r *http.Request) {
	token, err := auth.GetBearerToken(r.Header)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Missing or invalid token", err)
		return
	}

	userID, err := auth.ValidateJWT(token, cfg.jwtSecret)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid token", err)
		return
	}

	files, err := cfg.dbQueries.GetFilesByOwnerID(r.Context(), uuid.NullUUID{UUID: userID, Valid: true})
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Could not retrieve files", err)
		return
	}

	type FileResponse struct {
		ID        uuid.UUID `json:"id"`
		Filename  string    `json:"filename"`
		FileSize  int64     `json:"file_size"`
		CreatedAt time.Time `json:"created_at"`
		Metadata  string    `json:"metadata"` // Return raw JSON string of metadata
	}

	fileResponses := []FileResponse{}
	for _, f := range files {
		meta := ""
		if f.EncryptedMetadata.Valid {
			meta = f.EncryptedMetadata.String
		}
		fileResponses = append(fileResponses, FileResponse{
			ID:        f.ID,
			Filename:  f.Filename,
			FileSize:  f.FileSize,
			CreatedAt: f.CreatedAt,
			Metadata:  meta,
		})
	}

	respondWithJSON(w, http.StatusOK, fileResponses)
}
