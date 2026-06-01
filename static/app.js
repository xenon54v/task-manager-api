const API_URL = "";

let mode = "login";
let token = localStorage.getItem("access_token");
let currentUsername = localStorage.getItem("username");

const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const authForm = document.getElementById("auth-form");
const authSubmit = document.getElementById("auth-submit");
const authHint = document.getElementById("auth-hint");
const authMessage = document.getElementById("auth-message");

const authSection = document.getElementById("auth-section");
const tasksSection = document.getElementById("tasks-section");
const userStatus = document.getElementById("user-status");

const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskMessage = document.getElementById("task-message");
const tasksList = document.getElementById("tasks-list");

const totalCount = document.getElementById("total-count");
const doneCount = document.getElementById("done-count");
const logoutBtn = document.getElementById("logout-btn");

function setMessage(element, text, type = "") {
    element.textContent = text;
    element.className = "message";

    if (type) {
        element.classList.add(type);
    }
}

function switchMode(newMode) {
    mode = newMode;

    if (mode === "login") {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        authSubmit.textContent = "Login";
        authHint.textContent = "Don't have an account? Switch to the Register tab.";
    } else {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        authSubmit.textContent = "Register";
        authHint.textContent = "Already have an account? Switch to the Login tab.";
    }

    setMessage(authMessage, "");
}

function showApp() {
    if (token) {
        authSection.classList.add("hidden");
        tasksSection.classList.remove("hidden");
        userStatus.textContent = currentUsername ? `User: ${currentUsername}` : "Authenticated";
        loadTasks();
    } else {
        authSection.classList.remove("hidden");
        tasksSection.classList.add("hidden");
        userStatus.textContent = "Guest";
    }
}

async function register(username, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
    }

    return data;
}

async function login(username, password) {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data;
}

async function loadTasks() {
    const response = await fetch(`${API_URL}/tasks`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (response.status === 401) {
        logout();
        return;
    }

    const tasks = await response.json();

    renderTasks(tasks);
}

async function createTask(title, description) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            description,
            is_completed: false
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create task");
    }

    return data;
}

async function updateTaskStatus(task) {
    const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            is_completed: !task.is_completed
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update task status");
    }

    return data;
}

async function updateTaskText(taskId, title, description) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            description
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update task");
    }

    return data;
}

async function deleteTask(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to delete task");
    }

    return data;
}

function renderTasks(tasks) {
    tasksList.innerHTML = "";

    totalCount.textContent = `Total: ${tasks.length}`;

    const completedCount = tasks.filter(task => task.is_completed).length;
    doneCount.textContent = `Completed: ${completedCount}`;

    if (tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                There are no tasks yet. Add your first task above.
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("div");

        item.className = task.is_completed
            ? "task-item done"
            : "task-item";

        item.innerHTML = `
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.is_completed ? "checked" : ""}
            >

            <div class="task-content">
                <div class="task-view">
                    <p class="task-title"></p>
                    <p class="task-description"></p>
                </div>

                <form class="edit-form hidden">
                    <input
                        type="text"
                        class="edit-title"
                        placeholder="Task title"
                        required
                    >

                    <input
                        type="text"
                        class="edit-description"
                        placeholder="Task description"
                    >

                    <div class="edit-actions">
                        <button type="submit" class="small-btn">
                            Save
                        </button>

                        <button type="button" class="secondary-small-btn cancel-edit-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <div class="task-actions">
                <button class="small-btn edit-btn">Edit</button>
                <button class="danger-btn delete-btn">Delete</button>
            </div>
        `;

        const titleElement = item.querySelector(".task-title");
        const descriptionElement = item.querySelector(".task-description");

        const taskView = item.querySelector(".task-view");
        const editForm = item.querySelector(".edit-form");
        const editTitle = item.querySelector(".edit-title");
        const editDescription = item.querySelector(".edit-description");

        const checkbox = item.querySelector(".task-checkbox");
        const editButton = item.querySelector(".edit-btn");
        const cancelEditButton = item.querySelector(".cancel-edit-btn");
        const deleteButton = item.querySelector(".delete-btn");

        titleElement.textContent = task.title;
        descriptionElement.textContent = task.description || "No description";

        editTitle.value = task.title;
        editDescription.value = task.description || "";

        checkbox.addEventListener("change", async () => {
            try {
                await updateTaskStatus(task);
                await loadTasks();
            } catch (error) {
                setMessage(taskMessage, error.message, "error");
            }
        });

        editButton.addEventListener("click", () => {
            taskView.classList.add("hidden");
            editForm.classList.remove("hidden");

            editButton.classList.add("hidden");
            deleteButton.classList.add("hidden");

            checkbox.disabled = true;

            editTitle.focus();
        });

        cancelEditButton.addEventListener("click", () => {
            editTitle.value = task.title;
            editDescription.value = task.description || "";

            taskView.classList.remove("hidden");
            editForm.classList.add("hidden");

            editButton.classList.remove("hidden");
            deleteButton.classList.remove("hidden");

            checkbox.disabled = false;
        });

        editForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const newTitle = editTitle.value.trim();
            const newDescription = editDescription.value.trim();

            if (!newTitle) {
                setMessage(taskMessage, "Task title cannot be empty", "error");
                return;
            }

            try {
                await updateTaskText(task.id, newTitle, newDescription || null);
                setMessage(taskMessage, "Task updated successfully", "success");
                await loadTasks();
            } catch (error) {
                setMessage(taskMessage, error.message, "error");
            }
        });

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm("Are you sure you want to delete this task?");

            if (!confirmed) {
                return;
            }

            try {
                await deleteTask(task.id);
                setMessage(taskMessage, "Task deleted successfully", "success");
                await loadTasks();
            } catch (error) {
                setMessage(taskMessage, error.message, "error");
            }
        });

        tasksList.appendChild(item);
    });
}

function logout() {
    token = null;
    currentUsername = null;

    localStorage.removeItem("access_token");
    localStorage.removeItem("username");

    showApp();
}

loginTab.addEventListener("click", () => switchMode("login"));
registerTab.addEventListener("click", () => switchMode("register"));

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        setMessage(authMessage, "Please enter username and password", "error");
        return;
    }

    try {
        if (mode === "register") {
            await register(username, password);
            setMessage(authMessage, "Registration completed. You can now log in.", "success");
            switchMode("login");
            return;
        }

        const data = await login(username, password);

        token = data.access_token;
        currentUsername = username;

        localStorage.setItem("access_token", token);
        localStorage.setItem("username", username);

        setMessage(authMessage, "");
        showApp();
    } catch (error) {
        setMessage(authMessage, error.message, "error");
    }
});

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    if (!title) {
        setMessage(taskMessage, "Please enter a task title", "error");
        return;
    }

    try {
        await createTask(title, description || null);

        taskTitle.value = "";
        taskDescription.value = "";

        setMessage(taskMessage, "Task added successfully", "success");

        await loadTasks();
    } catch (error) {
        setMessage(taskMessage, error.message, "error");
    }
});

logoutBtn.addEventListener("click", logout);

showApp();