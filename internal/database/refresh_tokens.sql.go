package database

import (
	"context"
	"time"

	"github.com/google/uuid"
)
type CreateRefreshTokenParams struct {
	Token     string
	UserID    uuid.UUID
	ExpiresAt time.Time `json:"expires_at"`
	
}
const createRefreshToken = `-- name: CreateRefreshToken :one
INSERT INTO refresh_tokens (
    token,
    user_id,
    expires_at
) VALUES (
    $1, $2, $3
)
RETURNING token, created_at, updated_at, revoked_at, user_id, expires_at
`



func (q *Queries) CreateRefreshToken(ctx context.Context, arg CreateRefreshTokenParams) (RefreshToken, error) {
	row := q.db.QueryRowContext(ctx, createRefreshToken,
		arg.Token,
		arg.UserID,
		arg.ExpiresAt,
	)
	var i RefreshToken
	err := row.Scan(
		&i.Token,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.RevokedAt,
		&i.UserID,
		&i.ExpiresAt,
	)
	return i, err
}

const getRefreshToken = `-- name: GetRefreshToken :one
SELECT token, created_at, updated_at, revoked_at, user_id, expires_at FROM refresh_tokens
WHERE token = $1
`

func (q *Queries) GetRefreshToken(ctx context.Context, token string) (RefreshToken, error) {
	row := q.db.QueryRowContext(ctx, getRefreshToken, token)
	var i RefreshToken
	err := row.Scan(
		&i.Token,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.RevokedAt,
		&i.UserID,
		&i.ExpiresAt,
	)
	return i, err
}

const revokeRefreshToken = `-- name: RevokeRefreshToken :exec
UPDATE refresh_tokens
SET revoked_at = NOW(), updated_at = NOW()
WHERE token = $1
`



func (q *Queries) RevokeRefreshToken(ctx context.Context, token string) error {
	_, err := q.db.ExecContext(ctx, revokeRefreshToken, token)
	return err
}

const getUserByRefreshToken = `-- name: GetUserByRefreshToken :one
SELECT users.id, users.first_name, users.last_name, users.username, users.email, users.password_hash, users.public_key, users.private_key_encrypted, users.created_at, users.updated_at FROM users
JOIN refresh_tokens ON users.id = refresh_tokens.user_id
WHERE refresh_tokens.token = $1
`

func (q *Queries) GetUserByRefreshToken(ctx context.Context, token string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByRefreshToken, token)
	var i User
	err := row.Scan(
		&i.ID,
		&i.FirstName,
		&i.LastName,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.PublicKey,
		&i.PrivateKeyEncrypted,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

