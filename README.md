# Task Manager

**Task Manager** is an educational portfolio web application for managing personal tasks.

The project is built with **FastAPI** and demonstrates core backend development skills: REST API design, database integration, user authentication, JWT-protected routes, environment-based configuration, and automated API testing.

---

## Features

- User registration
- User login
- JWT authentication
- Password hashing
- Secret key storage in `.env`
- Create personal tasks
- View personal task list
- Edit task title and description
- Mark tasks as completed
- Delete tasks
- Prevent users from accessing other users' tasks
- Web interface built with HTML, CSS, and JavaScript
- Swagger API documentation
- Automated tests with `pytest`

---

## Tech Stack

- **Python**
- **FastAPI**
- **SQLAlchemy**
- **SQLite**
- **Pydantic**
- **JWT / PyJWT**
- **pwdlib / argon2**
- **python-dotenv**
- **Jinja2**
- **HTML**
- **CSS**
- **JavaScript**
- **Pytest**
- **HTTPX**
- **Uvicorn**

---

## Screenshots

### Login page

![Login page](screenshots/register-page.png)

### Task list

![Task list](screenshots/tasks-page.png)

### Swagger-documentation

![Swagger-documentation](screenshots/swagger-docs.png)

## Project Structure

```text
task-manager-api/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── security.py
│   └── config.py
│
├── static/
│   ├── style.css
│   └── app.js
│
├── templates/
│   └── index.html
│
├── tests/
│   └── test_api.py
│
├── screenshots/
│   ├── login-page.png
│   ├── tasks-page.png
│   └── swagger-docs.png
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
└── requirements.txt
```

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/xenon54v/task-manager-api.git
```

### 2. Open the project folder

```bash
cd task-manager-api
```

### 3. Create a virtual environment

```bash
python -m venv .venv
```

### 4. Activate the virtual environment

For Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

For Windows CMD:

```cmd
.venv\Scripts\activate
```

For macOS/Linux:

```bash
source .venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Create a `.env` file

Create a `.env` file in the project root using `.env.example` as a template.

Example `.env`:

```env
SECRET_KEY=super-secret-development-key-change-me
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The `.env` file is not committed to GitHub because it may contain sensitive data.

### 7. Run the application

```bash
uvicorn app.main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## API Endpoints

| Method | URL | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Log in and receive a JWT access token |
| `GET` | `/users/me` | Get current user data |
| `GET` | `/tasks` | Get the current user's task list |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/{task_id}` | Get a single task |
| `PATCH` | `/tasks/{task_id}` | Update a task |
| `DELETE` | `/tasks/{task_id}` | Delete a task |

---

## Authentication

The project uses JWT authentication.

After login, the user receives an access token.  
This token is used to access protected routes:

```text
Authorization: Bearer <access_token>
```

Each user can view, edit, and delete only their own tasks.

---

## Example Task

```json
{
  "title": "Learn FastAPI",
  "description": "Build a backend project for my portfolio",
  "is_completed": false
}
```

---

## Testing

The project includes automated API tests with `pytest`.

Run tests:

```bash
pytest
```

or:

```bash
python -m pytest
```

The tests cover:

- User registration
- Duplicate username validation
- User login
- Login with an incorrect password
- Protected task access without a token
- Task creation
- Task list retrieval
- Task update
- Task deletion
- Protection from accessing another user's tasks

Current test result:

```text
10 passed
```

---

## Implemented Functionality

The project includes:

- User model
- Task model
- Relationship between users and tasks
- User registration
- Unique username validation
- Secure password hashing
- Login with username and password
- JWT access token generation
- Current user validation by token
- Environment-based configuration
- CRUD operations for tasks
- Task editing through the web interface
- Protection from accessing other users' tasks
- Web interface built with HTML, CSS, and JavaScript
- Static files and HTML templates
- Swagger documentation
- Automated API tests

---

## Security

Basic security measures implemented in the project:

- Passwords are not stored in plain text
- Passwords are hashed
- Task access is protected by JWT
- Users can access only their own tasks
- The secret key is stored in `.env`
- `.env` is included in `.gitignore`
- Only `.env.example` is committed to the repository

---

## Project Status

The project is under development.

Planned improvements:

- Alembic migrations
- Docker support
- Task filtering
- Task search
- Project deployment

---

## Author

**Ksenia**

Junior Python Backend Developer

---

## License

This project is licensed under the MIT License.