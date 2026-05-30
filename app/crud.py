from sqlalchemy.orm import Session

from app.models import Task, User
from app.schemas import TaskCreate, TaskUpdate, UserCreate
from app.security import get_password_hash, verify_password

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user_data: UserCreate):
    new_user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)

    if user is None:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user

def get_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.owner_id == user_id).all()

def get_task_by_id(db: Session, task_id: int, user_id: int):
    return (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == user_id)
        .first()
    )

def create_task(db: Session, task_data: TaskCreate, user_id: int):
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        is_completed=task_data.is_completed,
        owner_id=user_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

def update_task(
    db: Session,
    task_id: int,
    task_data: TaskUpdate,
    user_id: int
):
    task = get_task_by_id(db, task_id, user_id)

    if task is None:
        return None

    update_data = task_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task

def delete_task(db: Session, task_id: int, user_id: int):
    task = get_task_by_id(db, task_id, user_id)

    if task is None:
        return None

    db.delete(task)
    db.commit()

    return task