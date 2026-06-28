# SecureFin Fintech Core - Secure Payment Prototype

This repository contains a secure software component designed for SecureFin Sdn. Bhd., as part of the ITS69405 Software Secure Systems module. The component focuses on **Secure Payment Processing** and **Cryptographic Audit Logging**, demonstrating the application of secure SDLC principles and mitigating critical OWASP vulnerabilities.

## Project Architecture

The prototype is split into two main components:
- **Frontend (Next.js):** Provides a Fintech Security Testing Suite UI to interact with the system and simulate adversarial attacks (MITM, Database Corruption).
- **Backend (NestJS):** The secure core API handling JWT authentication, payment processing, HMAC signature validation, and immutable hash-chained audit logging.

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Backend Setup (NestJS)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Rename `.env.example` to `.env` or create a `.env` file with the following:
   ```env
   JWT_SECRET=super_secret_jwt_key
   HMAC_SECRET=proto_payment_secret_2026_super_secure
   PORT=3001
   ```
4. Start the development server:
   ```bash
   npm run start:dev
   ```

### 2. Frontend Setup (Next.js)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Rename `.env.example` to `.env` or create a `.env` file with the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   PAYMENT_SECRET=proto_payment_secret_2026_super_secure
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`.

## Security Implementations (OWASP ASVS / CERT Compliance)

This project strictly adheres to secure coding standards and demonstrates multiple security controls:

1. **Input Validation (ASVS V5):** Strict validation of API inputs using NestJS `class-validator` Data Transfer Objects (DTOs). Ensures currencies follow ISO 4217, amounts are valid numbers, and IDs are properly formatted strings.
2. **Secure Password Storage (ASVS V2.4):** Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10 rounds) during database initialization.
3. **Cryptographic Authentication (ASVS V2 & V3):** Uses JWTs (JSON Web Tokens) for stateless, secure session management and role-based access control.
4. **Data Integrity & Anti-Tampering (ASVS V6):** Implements HMAC-SHA256 signatures for payment transactions. This ensures payloads are not modified in transit (MITM attacks) and verifies the sender's identity.
5. **Replay Attack Prevention:** Enforces idempotency keys on payment transfers so duplicate requests are ignored and transactions are processed exactly once.
6. **Immutable Audit Logging (ASVS V7):** Security events are recorded in an append-only ledger using SHA-256 cryptographic hash chaining. If any log is altered, the entire chain's integrity is compromised, ensuring tamper-evidence.

## Security Configuration

- **Key Storage:** Cryptographic secrets (`JWT_SECRET`, `HMAC_SECRET`) are never hardcoded in the source code. They are securely loaded into memory at runtime using environment variables (`.env`).
- **TLS/HTTPS:** This prototype is configured to run locally via HTTP for demonstration purposes. In a production environment, all communication between the frontend and backend must be enforced over TLS (HTTPS) to encrypt data in transit and protect bearer tokens.
- **Fail-Safe Defaults:** The API rejects transactions by default if signatures are missing, malformed, or if idempotency keys are reused.

## Testing & Validation
The UI includes a built-in **Abuse Case & Attack Sandbox Deck** for adversarial testing:
- **MITM Payload Tampering:** Modifies the payload mid-transit to verify the backend's HMAC signature validation rejects the request.
- **Database Log Corruption:** Simulates an insider attack by silently modifying a backend database record. Running the cryptographic audit verification reveals the broken hash chain.

## Default Mock Users

For testing purposes, the system seeds two users on startup:

| User | Email | Password |
|------|-------|----------|
| Alice | `alice@example.com` | `vW8#xK9$mP2!qL5` |
| Bob | `bob@example.com` | `rT4@nZ7&jQ1^cX3` |
