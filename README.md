# SureSubmit

Describe the form you need in plain English. SureSubmit builds it — fields, validation rules, and the logic that connects them — then hands you a visual builder to finish the job.

**Live app:** https://sure-submit-ai-form.vercel.app

---

## What it does

**AI form generation**
Type "student enrollment form with admission year, graduation year, and total marks" and get a working form with fields and cross-field validation rules already wired up.

**Visual form builder**
Add fields, configure types (short answer, paragraph, number, date, email, phone, URL, password, dropdown, multiple choice, checkboxes, file upload), set options, and delete fields you don't need. Undo and redo work properly, including back to the first change.

**Conditional visibility**
Show a field only when another field holds a specific value. Rules are validated server-side, so circular dependencies get rejected rather than looping.

**Theme colors**
Pick one of seven accent colors. It applies consistently across the builder chrome, the preview, dialogs, and the published form. The selected color is saved with the form.

**Publish, share, embed**
Publishing returns a public URL. Share by link, email, or iframe embed.

**Autosave**
Drafts are saved per user and restored on return, including the published form ID so sharing keeps working after a refresh.

**Responses**
Every submission is timestamped. Export results as CSV or JSON.

**Accounts**
Email/password registration and login with server-side sessions. Forgot-password flow with hashed, single-use, expiring tokens. Sessions are invalidated on password reset.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, Material UI 5, React Router 6 |
| Backend | Spring Boot 4.1, Java 17, Spring Data JPA |
| Database | MySQL |
| AI | Groq API (`openai/gpt-oss-120b`) |
| Email | Brevo HTTPS API, SMTP fallback |
| Deploy | Vercel (frontend), Render (backend) |

---

## Project structure

```
suresubmit-master/
├── suresubmit-frontend/          React + Vite
│   └── src/
│       ├── App.jsx               Routes, sidebar, app shell
│       ├── context/AuthContext.jsx
│       └── pages/
│           ├── FormBuilder.jsx   Builder, AI generation, preview, publish
│           ├── LiveForm.jsx      Public form rendering
│           ├── Dashboard.jsx
│           ├── Responses.jsx     Submissions + CSV/JSON export
│           └── ForgotPassword.jsx
│
├── suresubmit-backend/           Spring Boot
│   └── src/main/java/com/suresubmit/
│       ├── controller/           Auth, Form, Field, Rule, Submission, Health
│       ├── entity/               User, Form, Field, CrossFieldRule, …
│       └── service/              FormService, PasswordResetService,
│                                 NotificationService
│
└── database/
    └── schema.sql                Tables, indexes, timestamp backfill
```

---

## Getting started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven (or use the bundled `./mvnw`)
- MySQL 8+

### Database

```bash
mysql -u root -p < database/schema.sql
```

### Backend

```bash
cd suresubmit-backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`. Confirm with `GET /api/health`.

### Frontend

```bash
cd suresubmit-frontend
npm install
cp .env.example .env
npm run dev
```

---

## Configuration

### Frontend — `suresubmit-frontend/.env`

```bash
VITE_API_BASE=http://localhost:8080
VITE_GROQ_API_KEY=your_groq_api_key_here
```

`VITE_GROQ_API_KEY` is required for AI generation. Without it the rest of the builder still works.

### Backend — `application.properties`

```properties
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/suresubmit
spring.datasource.username=your_user
spring.datasource.password=your_password

app.mail.enabled=true
app.mail.from=your-verified-sender@example.com

spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=your_user
spring.mail.password=your_password
```

> **Note on email:** `app.mail.from` must exactly match a verified sender in your Brevo account. A mismatch fails silently at the provider level, so transactional mail appears to work and never arrives.

---

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Start session |
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password` | Complete reset |
| GET | `/api/forms` | List forms |
| POST | `/api/forms` | Create or publish a form |
| GET | `/api/forms/{id}` | Fetch a form |
| DELETE | `/api/forms/{formId}` | Delete a form |
| GET | `/api/fields/form/{formId}` | Fields for a form |
| GET | `/api/rules/form/{formId}` | Validation rules |
| PUT | `/api/rules/form/{formId}/rules/{ruleId}/approve` | Approve a rule |
| DELETE | `/api/rules/form/{formId}/rules/{ruleId}` | Remove a rule |
| GET | `/api/submissions` | Submissions |
| POST | `/api/submissions` | Submit a response |
| GET | `/api/health` | Health check |

---

## Security

Protected routes redirect unauthenticated users to `/login` without leaking content. Form deletion requires a matching owner. Password reset tokens are hashed, single-use, and expire; completing a reset invalidates existing sessions.

---

## Current status

Working: AI generation, builder, undo/redo, autosave, theming, conditional visibility, publish/share/embed, responses, CSV/JSON export, auth, password reset UI.

Known gaps: transactional email needs a verified sender address. The "Who has access" dialog is UI-only so far, it does not yet persist an access level. Clipboard and network failure paths, plus duplicate-publish prevention, are still being hardened.

---

## License

MIT