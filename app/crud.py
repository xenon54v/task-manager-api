from sqlalchemy.orm import Session
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate

def get_tasks(db: Session):
    return db.query(Task).all()

def get_task_by_id(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

def create_task(db: Session, task_data: TaskCreate):
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        is_completed=task_data.is_completed
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

def update_task(db: Session, task_id: int, task_data: TaskUpdate):
    task = get_task_by_id(db, task_id)

    if task is None:
        return None

    update_data = task_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task

def delete_task(db: Session, task_id: int):
    task = get_task_by_id(db, task_id)

    if task is None:
        return None

    db.delete(task)
    db.commit()

    return task