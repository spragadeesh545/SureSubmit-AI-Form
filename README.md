# ⚡ SureSubmit

### AI-Powered Form Builder with Smart Validation

> **Describe your form. SureSubmit builds it.**

SureSubmit is an AI-powered form builder that converts a plain-English description into a working form with fields, validation rules, and cross-field logic.

Instead of manually creating every field and validation rule, you simply describe what you need. SureSubmit generates the structure and rules, then gives you a visual builder where you can customize, preview, publish, and share the form.

**🌐 Live App:** [SureSubmit](https://sure-submit-ai-form.vercel.app)

---

## ✨ What Makes SureSubmit Different?

Traditional form builders require users to manually configure fields and validation rules.

SureSubmit adds an AI layer that understands the **relationship between fields**.

For example:

> "Create a student enrollment form with admission year, graduation year, and total marks."

SureSubmit can generate:

* Student Name
* Admission Year
* Graduation Year
* Total Marks
* Cross-field validation
* Field configuration
* Conditional logic

You can then modify everything visually before publishing.

---

# 🚀 Features

### 🤖 AI Form Generation

Describe the form you need using natural language and let AI generate the initial structure.

```text
Student enrollment form with admission year,
graduation year, department, email and total marks.
```

The generated form can then be edited using the visual builder.

---

### 🧩 Visual Form Builder

Create and customize forms without writing code.

Supported field types include:

* Short Answer
* Paragraph
* Number
* Date
* Email
* Phone
* URL
* Password
* Dropdown
* Multiple Choice
* Checkboxes
* File Upload

You can:

* Add fields
* Delete fields
* Configure field types
* Configure options
* Edit validation
* Rearrange form structure
* Preview the form
* Undo changes
* Redo changes

---

### 🔗 Cross-Field Validation

SureSubmit supports validation rules that depend on multiple fields.

Example:

```text
Graduation Year must be greater than Admission Year
```

Instead of treating every field independently, SureSubmit can understand relationships between fields.

Rules are also validated on the server side.

Circular dependencies are rejected to prevent infinite validation loops.

---

### 👁️ Conditional Visibility

Display fields based on another field's value.

Example:

```text
Are you a student?
        ↓
      Yes
        ↓
Show "College Name"
```

This allows forms to dynamically adapt to the user's responses.

---

### 🎨 Custom Themes

Choose from **7 accent colors**.

The selected theme is consistently applied across:

* Builder
* Preview
* Dialogs
* Published forms
* Form controls

The selected theme is also saved with the form.

---

### 📤 Publish & Share

Publish a completed form and receive a public URL.

Forms can be shared through:

* 🔗 Copy Link
* 📧 Email
* 🖼️ Iframe Embed

This allows a form created inside SureSubmit to be used outside the application.

---

### 💾 Autosave

Draft forms are automatically saved per user.

When returning to the application, your work can be restored, including:

* Form structure
* Fields
* Validation rules
* Theme
* Draft state
* Published form ID

This also allows sharing to continue working after refreshing the page.

---

### 📊 Response Management

Every form submission is timestamped and stored.

Users can view submitted responses and export them as:

```text
CSV
JSON
```

This makes the collected data easier to analyze or integrate with other systems.

---

### 🔐 Authentication & Security

SureSubmit includes:

* Email/password registration
* Login
* Logout
* Server-side sessions
* Protected routes
* Forgot password
* Password reset
* Hashed reset tokens
* Single-use reset tokens
* Expiring reset tokens
* Session invalidation after password reset
* Form ownership checks

---

# 🧠 How SureSubmit Works

```text
                 USER
                   │
                   ▼
        Describe the Form
                   │
                   ▼
             AI Generation
                   │
                   ▼
        Fields + Validation Rules
                   │
                   ▼
          Visual Form Builder
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       Preview  Configure  Validate
          │        │        │
          └────────┼────────┘
                   ▼
                Publish
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        Link     Email     Embed
                   │
                   ▼
              Responses
                   │
             ┌─────┴─────┐
             ▼           ▼
            CSV         JSON
```

---

# 🏗️ System Architecture

```text
┌─────────────────────────────┐
│          User               │
│      Issuer / Creator       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      React Frontend         │
│   Vite + Material UI        │
└──────────────┬──────────────┘
               │ REST API
               ▼
┌─────────────────────────────┐
│     Spring Boot Backend     │
│        Java 17              │
└──────────────┬──────────────┘
               │
      ┌────────┼─────────┐
      ▼        ▼         ▼
    Forms    Rules    Submissions
      │        │         │
      └────────┼─────────┘
               ▼
┌─────────────────────────────┐
│           MySQL             │
└─────────────────────────────┘

        ┌─────────────────┐
        │    Groq API     │
        │  AI Generation  │
        └─────────────────┘

        ┌─────────────────┐
        │  Brevo / SMTP   │
        │     Email       │
        └─────────────────┘
```

---

# 🛠️ Tech Stack

| Layer               | Technology             |
| ------------------- | ---------------------- |
| Frontend            | React 18               |
| Build Tool          | Vite 8                 |
| UI                  | Material UI 5          |
| Routing             | React Router 6         |
| Backend             | Spring Boot 4.1        |
| Language            | Java 17                |
| ORM                 | Spring Data JPA        |
| Database            | MySQL 8                |
| AI                  | Groq API               |
| AI Model            | `openai/gpt-oss-120b`  |
| Email               | Brevo HTTPS API + SMTP |
| Frontend Deployment | Vercel                 |
| Backend Deployment  | Render                 |

---

# 📁 Project Structure

```text
suresubmit-master/
│
├── suresubmit-frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   └── pages/
│   │       ├── FormBuilder.jsx
│   │       ├── LiveForm.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Responses.jsx
│   │       └── ForgotPassword.jsx
│   │
│   └── ...
│
├── suresubmit-backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── suresubmit/
│   │                   ├── controller/
│   │                   ├── entity/
│   │                   └── service/
│   │
│   └── ...
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

* Node.js 18+
* Java 17+
* Maven
* MySQL 8+

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>

cd suresubmit-master
```

---

## 2. Configure MySQL

Create the database using:

```bash
mysql -u root -p < database/schema.sql
```

Update your database credentials in the backend configuration.

---

## 3. Start the Backend

```bash
cd suresubmit-backend
```

Run:

```bash
./mvnw spring-boot:run
```

The backend will run on:

```text
http://localhost:8080
```

Check the backend:

```text
GET /api/health
```

---

## 4. Configure the Frontend

```bash
cd ../suresubmit-frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure:

```env
VITE_API_BASE=http://localhost:8080
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> The Groq API key is required only for AI form generation. The rest of the form builder can work without AI generation.

---

## 5. Start the Frontend

```bash
npm run dev
```

The application will be available through the Vite development server.

---

# 🔑 Backend Configuration

Configure the following values in `application.properties`:

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

### 📧 Email Configuration

The sender configured in:

```properties
app.mail.from
```

must match a verified sender configured with your email provider.

If the sender is not verified correctly, transactional emails may not arrive even though the application appears to send them successfully.

---

# 🔌 API Reference

| Method   | Endpoint                                          | Description            |
| -------- | ------------------------------------------------- | ---------------------- |
| `POST`   | `/api/auth/register`                              | Create account         |
| `POST`   | `/api/auth/login`                                 | Start session          |
| `POST`   | `/api/auth/logout`                                | End session            |
| `GET`    | `/api/auth/me`                                    | Get current user       |
| `POST`   | `/api/auth/forgot-password`                       | Request password reset |
| `POST`   | `/api/auth/reset-password`                        | Reset password         |
| `GET`    | `/api/forms`                                      | List forms             |
| `POST`   | `/api/forms`                                      | Create/publish form    |
| `GET`    | `/api/forms/{id}`                                 | Get form               |
| `DELETE` | `/api/forms/{formId}`                             | Delete form            |
| `GET`    | `/api/fields/form/{formId}`                       | Get form fields        |
| `GET`    | `/api/rules/form/{formId}`                        | Get validation rules   |
| `PUT`    | `/api/rules/form/{formId}/rules/{ruleId}/approve` | Approve rule           |
| `DELETE` | `/api/rules/form/{formId}/rules/{ruleId}`         | Delete rule            |
| `GET`    | `/api/submissions`                                | Get submissions        |
| `POST`   | `/api/submissions`                                | Submit response        |
| `GET`    | `/api/health`                                     | Health check           |

---

# 🔒 Security

SureSubmit protects application data using multiple server-side controls.

### Authentication

Unauthenticated users attempting to access protected routes are redirected to the login page.

### Form Ownership

Form deletion requires the authenticated user to own the corresponding form.

### Password Reset

Password reset tokens are:

* Hashed
* Single-use
* Time-limited
* Invalidated after successful password reset

Existing sessions are also invalidated after a password reset.

---

# 🌐 Deployment

SureSubmit uses separate deployment environments for the frontend and backend.

```text
                    ┌──────────────┐
                    │    Users     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Vercel    │
                    │   Frontend   │
                    └──────┬───────┘
                           │
                         REST
                           │
                           ▼
                    ┌──────────────┐
                    │    Render    │
                    │   Backend    │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    ▼              ▼
                ┌───────┐      ┌───────┐
                │ MySQL │      │ Groq  │
                └───────┘      └───────┘
```

---

# 📸 Screenshots

> Add your application screenshots here.

### Dashboard

```text
screenshots/dashboard.png
```

### AI Form Generation

```text
screenshots/ai-generation.png
```

### Form Builder

```text
screenshots/form-builder.png
```

### Conditional Rules

```text
screenshots/conditional-rules.png
```

### Published Form

```text
screenshots/published-form.png
```

### Responses

```text
screenshots/responses.png
```

---

# 🧪 Current Status

### ✅ Working

* AI form generation
* Visual form builder
* Multiple field types
* Cross-field validation
* Conditional visibility
* Server-side rule validation
* Undo / redo
* Autosave
* Theme customization
* Form preview
* Form publishing
* Public form URLs
* Link sharing
* Email sharing
* Iframe embedding
* Response collection
* CSV export
* JSON export
* Authentication
* Password reset

### 🚧 In Progress

* Transactional email hardening
* Access-level persistence
* Clipboard failure handling
* Network failure handling
* Duplicate-publish prevention

---

# 🗺️ Roadmap

Future improvements can include:

* [ ] Drag-and-drop field ordering
* [ ] More advanced conditional logic
* [ ] Form templates
* [ ] Richer AI-generated validation
* [ ] Collaborative form editing
* [ ] Persistent access management
* [ ] Advanced response analytics
* [ ] Webhook integrations
* [ ] API keys for external integrations
* [ ] More export formats
* [ ] Version history
* [ ] Form duplication
* [ ] Improved accessibility

---

# 💡 Example

### Input

```text
Create a job application form with
name, email, years of experience,
qualification and current company.
```

### SureSubmit generates

```text
┌─────────────────────────────┐
│       Job Application       │
├─────────────────────────────┤
│ Full Name                   │
│ [________________________]  │
│                             │
│ Email                       │
│ [________________________]  │
│                             │
│ Years of Experience         │
│ [________________________]  │
│                             │
│ Qualification               │
│ [ Select qualification ▼ ]  │
│                             │
│ Current Company             │
│ [________________________]  │
│                             │
│        [ Submit ]           │
└─────────────────────────────┘
```

The generated structure can then be customized using the visual builder before publishing.

---

# 🎯 Core Idea

SureSubmit combines **AI generation + visual editing + intelligent validation** into one workflow.

```text
Describe
   ↓
Generate
   ↓
Customize
   ↓
Validate
   ↓
Preview
   ↓
Publish
   ↓
Share
   ↓
Collect Responses
```

The goal is simple:

> **Less configuration. More intelligent forms.**

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

# 📄 License

This project is currently maintained as a private/open development project.

Add your preferred license here when the repository license is finalized.

---

<div align="center">

### ⚡ SureSubmit

**Describe it. Build it. Validate it. Publish it.**

Built with React · Spring Boot · MySQL · Groq AI

🌐 [Live Application](https://sure-submit-ai-form.vercel.app)

</div>
