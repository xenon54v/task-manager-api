import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite://"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)

def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def prepare_test_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)

def register_user(username="ksenia", password="123456"):
    return client.post(
        "/register",
        json={
            "username": username,
            "password": password
        }
    )

def login_user(username="ksenia", password="123456"):
    return client.post(
        "/login",
        data={
            "username": username,
            "password": password
        }
    )

def get_auth_headers(username="ksenia", password="123456"):
    register_user(username, password)

    response = login_user(username, password)

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }

def test_register_user_success():
    response = register_user()

    assert response.status_code == 201

    data = response.json()

    assert data["username"] == "ksenia"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data

def test_register_user_duplicate_username():
    first_response = register_user()
    second_response = register_user()

    assert first_response.status_code == 201
    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "Username already registered"

def test_login_user_success():
    register_user()

    response = login_user()

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_user_wrong_password():
    register_user()

    response = login_user(password="wrong-password")

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

def test_get_tasks_without_token_is_forbidden():
    response = client.get("/tasks")

    assert response.status_code == 401

def test_create_task_success():
    headers = get_auth_headers()

    response = client.post(
        "/tasks",
        json={
            "title": "Изучить FastAPI",
            "description": "Сделать проект для портфолио",
            "is_completed": False
        },
        headers=headers
    )

    assert response.status_code == 201

    data = response.json()

    assert data["title"] == "Изучить FastAPI"
    assert data["description"] == "Сделать проект для портфолио"
    assert data["is_completed"] is False
    assert "id" in data
    assert "owner_id" in data

def test_get_tasks_success():
    headers = get_auth_headers()

    client.post(
        "/tasks",
        json={
            "title": "Первая задача",
            "description": "Описание первой задачи",
            "is_completed": False
        },
        headers=headers
    )

    client.post(
        "/tasks",
        json={
            "title": "Вторая задача",
            "description": "Описание второй задачи",
            "is_completed": True
        },
        headers=headers
    )

    response = client.get("/tasks", headers=headers)

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert data[0]["title"] == "Первая задача"
    assert data[1]["title"] == "Вторая задача"

def test_update_task_success():
    headers = get_auth_headers()

    create_response = client.post(
        "/tasks",
        json={
            "title": "Старая задача",
            "description": "Старое описание",
            "is_completed": False
        },
        headers=headers
    )

    task_id = create_response.json()["id"]

    update_response = client.patch(
        f"/tasks/{task_id}",
        json={
            "title": "Новая задача",
            "description": "Новое описание",
            "is_completed": True
        },
        headers=headers
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["title"] == "Новая задача"
    assert data["description"] == "Новое описание"
    assert data["is_completed"] is True

def test_delete_task_success():
    headers = get_auth_headers()

    create_response = client.post(
        "/tasks",
        json={
            "title": "Удалить задачу",
            "description": "Эта задача будет удалена",
            "is_completed": False
        },
        headers=headers
    )

    task_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/tasks/{task_id}",
        headers=headers
    )

    assert delete_response.status_code == 200

    get_response = client.get(
        f"/tasks/{task_id}",
        headers=headers
    )

    assert get_response.status_code == 404

def test_user_cannot_access_another_user_task():
    first_user_headers = get_auth_headers(
        username="ksenia",
        password="123456"
    )

    create_response = client.post(
        "/tasks",
        json={
            "title": "Личная задача",
            "description": "Задача первого пользователя",
            "is_completed": False
        },
        headers=first_user_headers
    )

    task_id = create_response.json()["id"]

    second_user_headers = get_auth_headers(
        username="another_user",
        password="123456"
    )

    response = client.get(
        f"/tasks/{task_id}",
        headers=second_user_headers
    )

    assert response.status_code == 404