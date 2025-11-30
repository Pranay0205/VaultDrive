# VaultDrive

A secure, self-hosted file storage backend written in Go. Think of it like a personal Dropbox, but with a heavy focus on encryption and privacy.

## What it does

VaultDrive handles the heavy lifting for a secure file sharing system. It's designed to work with a frontend that handles client-side encryption, while the backend manages storage, authentication, and key exchange.

**Key Features:**
*   **User Auth**: Secure signup/login with JWTs and automatic RSA key generation.
*   **Encrypted Storage**: Files are stored on disk, but the backend only sees encrypted blobs. We store the metadata (IV, salt) so the client can decrypt it.
*   **Secure Sharing**: Share files with other users without revealing your password or the raw file key. We use a "wrapped key" system (encrypting the file key with the recipient's public key).
*   **Access Control**: Revoke access to shared files instantly.

## Tech Stack

*   **Language**: Go (Golang)
*   **Database**: PostgreSQL
*   **ORM-ish**: sqlc (for type-safe SQL queries)
*   **Auth**: JWT + Refresh Tokens

## Setup

1.  **Clone the repo**
    ```bash
    git clone https://github.com/Pranay0205/VaultDrive.git
    cd VaultDrive
    ```

2.  **Database**
    Make sure you have PostgreSQL running. Create a database named `vaultdrive` (or whatever you prefer).

3.  **Environment Variables**
    Create a `.env` file in the root:
    ```env
    PORT=8080
    DB_URL=postgres://user:password@localhost:5432/vaultdrive?sslmode=disable
    JWT_SECRET=your-super-secret-key-change-this
    ```

4.  **Run it**
    ```bash
    go run main.go
    ```

## API Endpoints

Here's a quick look at what you can hit:

*   `POST /register` - Create account & generate keys
*   `POST /login` - Get tokens & your encrypted private key
*   `POST /files/upload` - Upload a file (multipart)
*   `GET /files` - List your files
*   `GET /files/{id}/download` - Download file stream
*   `POST /files/{id}/share` - Share with another user
*   `DELETE /files/{id}/revoke/{user_id}` - Revoke access

## How the Security Works

We don't trust the server with raw keys.
1.  **On Register**: The server generates an RSA keypair. The private key is encrypted with your password (AES-256) before being saved to the DB.
2.  **On Upload**: The client (frontend) encrypts the file with a random AES key. That key is then encrypted with the user's public key and sent to the server as a `wrapped_key`.
3.  **On Share**: To share, the client fetches the recipient's public key, re-encrypts the file's AES key with it, and sends that new `wrapped_key` to the server.
