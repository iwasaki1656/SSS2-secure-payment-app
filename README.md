# 🛡️ SecureFin Fintech Core - Secure Payment Prototype

This repository contains a secure software component designed for **SecureFin Sdn. Bhd.**, as part of the ITS69405 Software Secure Systems module. The component focuses on **Secure Payment Processing** and **Cryptographic Audit Logging**, demonstrating the application of secure SDLC principles and mitigating critical OWASP vulnerabilities.

---

## 🏗️ Project Architecture

The prototype is split into two main components:

- **Frontend (Next.js):** Provides a Fintech Security Testing Suite UI to interact with the system and simulate adversarial attacks (MITM, Database Corruption).
- **Backend (NestJS):** The secure core API handling JWT authentication, payment processing, HMAC signature validation, and immutable hash-chained audit logging.

---

## 🚀 Setup and Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

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
   PORT=3001
   JWT_SECRET=super_secret_jwt_key
   HMAC_SECRET=proto_payment_secret_2026_super_secure
   DB_ENCRYPTION_KEY=aegispay_dev_key_32bytes_padding!
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
   PAYMENT_SIGNING_SECRET=proto_payment_secret_2026_super_secure
   PORT=3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Access the application at **`http://localhost:3000`**.

---

## 🔒 Security Implementations (OWASP ASVS / CERT Compliance)

This project strictly adheres to secure coding standards and demonstrates multiple advanced security controls.

### Phase I: Core Protections
1. **Input Validation (ASVS V5):** Strict validation of API inputs using NestJS `class-validator` Data Transfer Objects (DTOs). Ensures currencies follow ISO 4217, amounts are valid numbers, and IDs are properly formatted strings.
2. **Secure Password Storage (ASVS V2.4):** Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (12 rounds).
3. **Cryptographic Authentication (ASVS V2 & V3):** Uses JWTs (JSON Web Tokens) for stateless, secure session management and role-based access control.
4. **Data Integrity & Anti-Tampering (ASVS V6):** Implements HMAC-SHA256 signatures for payment transactions. This ensures payloads are not modified in transit (MITM attacks) and verifies the sender's identity.
5. **Replay Attack Prevention:** Enforces idempotency keys on payment transfers so duplicate requests are ignored and transactions are processed exactly once.
6. **Immutable Audit Logging (ASVS V7):** Security events are recorded in an append-only ledger using SHA-256 cryptographic hash chaining. If any log is altered, the entire chain's integrity is compromised, ensuring tamper-evidence.

### Phase II: Advanced Hardening
7. **True Session Invalidation:** When a user logs out, their JWT's unique ID (`jti`) is added to an in-memory Blocklist. The system actively checks incoming tokens against this list and outright rejects revoked tokens, mitigating stolen token reuse.
8. **Idle Inactivity Timeout:** The frontend enforces a 5-minute inactivity timer (monitoring mouse, keyboard, touch, and scroll events). If no activity is detected, the session is forcefully terminated and the JWT is blocklisted.
9. **Two-Factor Transaction Authorization:** Users can set a 4-digit Transaction PIN. This PIN is hashed with bcrypt and must be provided during any transfer request, preventing unauthorized transfers even if a session is hijacked.
10. **Fraud Detection (Velocity Limits):** The payment engine prevents account draining via two critical checks:
    - **Single Transaction Cap:** Transfers exceeding 20,000 units are blocked.
    - **Daily Velocity Cap:** The total sum of a user's outgoing transfers over a rolling 24-hour window cannot exceed 50,000 units.
11. **Data Encryption at Rest:** Sensitive PII (like User Emails) is heavily encrypted using AES-256-GCM before being persisted to the JSON datastore, ensuring confidentiality in the event of an arbitrary file read or server compromise.

---

## ⚙️ Security Configuration

- **Key Storage:** Cryptographic secrets (`JWT_SECRET`, `HMAC_SECRET`, `DB_ENCRYPTION_KEY`) are never hardcoded in the source code. They are securely loaded into memory at runtime using environment variables (`.env`).
- **TLS/HTTPS:** This prototype is configured to run locally via HTTP for demonstration purposes. In a production environment, all communication between the frontend and backend must be enforced over TLS (HTTPS) to encrypt data in transit and protect bearer tokens.
- **Fail-Safe Defaults:** The API rejects transactions by default if signatures are missing, malformed, or if idempotency keys are reused.

---

## 🧪 Testing & Validation

The UI includes a built-in **Abuse Case & Attack Sandbox Deck** for adversarial testing:
- **MITM Payload Tampering:** Modifies the payload mid-transit to verify the backend's HMAC signature validation rejects the request.
- **Database Log Corruption:** Simulates an insider attack by silently modifying a backend database record. Running the cryptographic audit verification reveals the broken hash chain.

---

## 👥 Default Mock Users

For testing purposes, the system seeds the following users on startup:

| Role | User | Email | Password |
|------|------|-------|----------|
| 👤 **User** | Alice | `alice@example.com` | `vW8#xK9$mP2!qL5` |
| 👤 **User** | Bob | `bob@example.com` | `rT4@nZ7&jQ1^cX3` |
| 🛡️ **Admin**| Admin | `admin@securefin.com` | `Admin@SecureFin2026!` |

*(Note: The Admin account can log in by clicking the "Admin Portal" toggle on the frontend login page).*


## File Structure
. (SSS)
├── backend
│   ├── src
│   │   ├── admin
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.module.ts
│   │   │   └── admin.service.ts
│   │   ├── audit
│   │   │   ├── audit.controller.spec.ts
│   │   │   ├── audit.controller.ts
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.service.spec.ts
│   │   │   └── audit.service.ts
│   │   ├── auth
│   │   │   ├── dto
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── signup.dto.ts
│   │   │   │   └── update-profile.dto.ts
│   │   │   ├── guards
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   ├── roles.decorator.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── auth.controller.spec.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.spec.ts
│   │   │   └── auth.service.ts
│   │   ├── common
│   │   │   ├── filters
│   │   │   │   └── all-exceptions.filter.ts
│   │   │   └── interceptors
│   │   │       └── transform.interceptor.ts
│   │   ├── database
│   │   │   ├── database.module.ts
│   │   │   ├── database.service.spec.ts
│   │   │   ├── database.service.ts
│   │   │   └── models.ts
│   │   ├── email
│   │   │   ├── email.module.ts
│   │   │   └── email.service.ts
│   │   ├── payments
│   │   │   ├── dto
│   │   │   │   ├── request-code.dto.ts
│   │   │   │   ├── resend-code.dto.ts
│   │   │   │   └── transfer.dto.ts
│   │   │   ├── guards
│   │   │   │   ├── idempotency.guard.ts
│   │   │   │   └── signature.guard.ts
│   │   │   ├── payments.controller.spec.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.service.spec.ts
│   │   │   └── payments.service.ts
│   │   ├── utils
│   │   │   └── masking.util.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── .env
│   ├── .env.example
│   ├── .prettierrc
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── frontend
│   ├── app
│   │   ├── api
│   │   │   └── v1
│   │   │       ├── admin
│   │   │       │   ├── transactions
│   │   │       │   │   └── route.ts
│   │   │       │   └── users
│   │   │       │       ├── [id]
│   │   │       │       │   └── status
│   │   │       │       │       └── route.ts
│   │   │       │       └── route.ts
│   │   │       ├── audit
│   │   │       │   ├── logs
│   │   │       │   │   └── route.ts
│   │   │       │   ├── tamper
│   │   │       │   │   └── route.ts
│   │   │       │   └── verify
│   │   │       │       └── route.ts
│   │   │       ├── auth
│   │   │       │   ├── admin-login
│   │   │       │   │   └── route.ts
│   │   │       │   ├── login
│   │   │       │   │   └── route.ts
│   │   │       │   ├── logout
│   │   │       │   │   └── route.ts
│   │   │       │   ├── profile
│   │   │       │   │   └── route.ts
│   │   │       │   └── signup
│   │   │       │       └── route.ts
│   │   │       └── payments
│   │   │           ├── transfer
│   │   │           │   ├── request-code
│   │   │           │   │   └── route.ts
│   │   │           │   ├── resend-code
│   │   │           │   │   └── route.ts
│   │   │           │   └── route.ts
│   │   │           └── route.ts
│   │   ├── utils
│   │   │   └── crypto.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── .env
│   ├── .env.example
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── .gitignore
├── .node-version
├── package.json
├── README.md
├── scratch.js
└── test_request.js
