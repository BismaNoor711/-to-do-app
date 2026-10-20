
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const $ = function (id) {
        return document.getElementById(id);
    };

    const taskForm = $("taskForm");
    const taskTitle = $("taskTitle");
    const category = $("category");
    const priority = $("priority");
    const dueDate = $("dueDate");
    const taskList = $("taskList");
    const searchInput = $("searchInput");
    const formMessage = $("formMessage");
    const apiMessage = $("apiMessage");

    let currentFilter = "all";
    let tasks = [];

    const subjects = [
        "Web Development",
        "Data Structures",
        "Database Systems",
        "Operating Systems",
        "Computer Networks",
        "Artificial Intelligence",
        "Mathematics",
        "Software Engineering",
        "Information Security",
        "Other"
    ];

    function makeId() {
        return String(Date.now()) + String(Math.random()).slice(2);
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[char];
        });
    }

    function showMessage(element, message) {
        if (!element) return;

        element.textContent = message;

        window.setTimeout(function () {
            if (element.textContent === message) {
                element.textContent = "";
            }
        }, 3000);
    }

    function saveTasks() {
        try {
            localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
        } catch (error) {
            showMessage(formMessage, "Unable to save tasks in this browser.");
        }
    }

    function loadTasks() {
        try {
            const saved = localStorage.getItem("taskflow_tasks");

            if (saved) {
                const parsed = JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    tasks = parsed;
                }
            }
        } catch (error) {
            tasks = [];
        }

        if (tasks.length === 0) {
            tasks = [
                {
                    id: makeId(),
                    title: "Complete JavaScript DOM practice",
                    category: "Web Development",
                    priority: "High",
                    dueDate: "",
                    completed: false
                },
                {
                    id: makeId(),
                    title: "Revise Binary Search and Trees",
                    category: "Data Structures",
                    priority: "Medium",
                    dueDate: "",
                    completed: false
                },
                {
                    id: makeId(),
                    title: "Practice SQL SELECT queries",
                    category: "Database Systems",
                    priority: "High",
                    dueDate: "",
                    completed: false
                },
                {
                    id: makeId(),
                    title: "Review process scheduling",
                    category: "Operating Systems",
                    priority: "Medium",
                    dueDate: "",
                    completed: true
                },
                {
                    id: makeId(),
                    title: "Study calculus formulas",
                    category: "Mathematics",
                    priority: "Low",
                    dueDate: "",
                    completed: false
                },
                {
                    id: makeId(),
                    title: "Prepare computer networks notes",
                    category: "Computer Networks",
                    priority: "Medium",
                    dueDate: "",
                    completed: false
                }
            ];

            saveTasks();
        }
    }

    function formatDate(value) {
        if (!value) return "No due date";

        const date = new Date(value + "T00:00:00");

        if (isNaN(date.getTime())) return "No due date";

        return date.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function updateDate() {
        const now = new Date();

        if ($("dayName")) {
            $("dayName").textContent = now.toLocaleDateString(undefined, {
                weekday: "long"
            });
        }

        if ($("todayDate")) {
            $("todayDate").textContent = now.toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        if ($("year")) {
            $("year").textContent = now.getFullYear();
        }
    }

    function updateStatistics() {
        const total = tasks.length;
        const completed = tasks.filter(function (task) {
            return task.completed;
        }).length;

        const remaining = total - completed;
        const percentage = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        $("totalCount").textContent = total;
        $("doneCount").textContent = completed;
        $("remainingCount").textContent = remaining;
        $("progressPercent").textContent = percentage + "%";
        $("progressBar").style.width = percentage + "%";
        $("taskBadge").textContent = total + (total === 1 ? " task" : " tasks");

        $("taskSummary").textContent = remaining === 0
            ? "All tasks completed!"
            : "You have " + remaining + " task" +
              (remaining === 1 ? "" : "s") + " remaining.";
    }

    function getVisibleTasks() {
        const query = searchInput.value.trim().toLowerCase();

        return tasks.filter(function (task) {
            const title = String(task.title || "").toLowerCase();
            const subject = String(task.category || "").toLowerCase();

            const matchesSearch =
                title.includes(query) || subject.includes(query);

            const matchesFilter =
                currentFilter === "all" ||
                (currentFilter === "active" && !task.completed) ||
                (currentFilter === "completed" && task.completed);

            return matchesSearch && matchesFilter;
        });
    }

    function renderTasks() {
        const visibleTasks = getVisibleTasks();

        taskList.innerHTML = "";

        $("emptyState").hidden = visibleTasks.length !== 0;

        if (visibleTasks.length === 0) {
            $("emptyTitle").textContent = tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks";

            $("emptyText").textContent = tasks.length === 0
                ? "Add your first task using the form."
                : "Try another search or filter.";

        }

        visibleTasks.forEach(function (task) {
            const item = document.createElement("article");
            item.className = "task-item";
            item.dataset.id = task.id;

            if (task.completed) {
                item.classList.add("completed");
            }

            const today = new Date().toISOString().slice(0, 10);
            const overdue = task.dueDate &&
                task.dueDate < today &&
                !task.completed;

            const safePriority = ["High", "Medium", "Low"].includes(task.priority)
                ? task.priority
                : "Medium";

            item.innerHTML = `
                <input
                    type="checkbox"
                    class="task-checkbox"
                    aria-label="Mark task completed"
                    ${task.completed ? "checked" : ""}
                >

                <div class="task-content">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>

                    <div class="task-meta">
                        <span class="task-category">
                            ${escapeHTML(task.category || "Other")}
                        </span>

                        <span class="task-priority priority-${safePriority.toLowerCase()}">
                            ${safePriority}
                        </span>

                        <span class="${overdue ? "overdue" : ""}">
                            ${escapeHTML(formatDate(task.dueDate))}
                        </span>
                    </div>
                </div>

                <div class="task-actions">
                    <button type="button" class="edit-task">Edit</button>
                    <button type="button" class="delete-task">Delete</button>
                </div>
            `;

            taskList.appendChild(item);
        });

        updateStatistics();
    }

    function addTask(title, subject, taskPriority, taskDate) {
        if (!title.trim()) {
            showMessage(formMessage, "Please enter a task name.");
            return;
        }

        tasks.unshift({
            id: makeId(),
            title: title.trim(),
            category: subject,
            priority: taskPriority,
            dueDate: taskDate,
            completed: false
        });

        saveTasks();
        renderTasks();
        taskForm.reset();

        showMessage(formMessage, "Task added successfully!");
    }

    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        addTask(
            taskTitle.value,
            category.value,
            priority.value,
            dueDate.value
        );
    });

    taskList.addEventListener("change", function (event) {
        if (!event.target.classList.contains("task-checkbox")) return;

        const item = event.target.closest(".task-item");
        if (!item) return;

        const task = tasks.find(function (entry) {
            return entry.id === item.dataset.id;
        });

        if (!task) return;

        task.completed = event.target.checked;

        saveTasks();
        renderTasks();
    });

    taskList.addEventListener("click", function (event) {
        const item = event.target.closest(".task-item");
        if (!item) return;

        const id = item.dataset.id;

        if (event.target.closest(".delete-task")) {
            tasks = tasks.filter(function (task) {
                return task.id !== id;
            });

            saveTasks();
            renderTasks();
            showMessage(formMessage, "Task deleted.");
            return;
        }

        if (event.target.closest(".edit-task")) {
            const task = tasks.find(function (entry) {
                return entry.id === id;
            });

            if (!task) return;

            const newTitle = prompt("Edit task name:", task.title);

            if (newTitle === null) return;

            if (!newTitle.trim()) {
                showMessage(formMessage, "Task name cannot be empty.");
                return;
            }

            const newSubject = prompt(
                "Subject (" + subjects.join(", ") + "):",
                task.category
            );

            if (newSubject === null) return;

            task.title = newTitle.trim();
            task.category = subjects.includes(newSubject.trim())
                ? newSubject.trim()
                : "Other";

            saveTasks();
            renderTasks();
            showMessage(formMessage, "Task updated.");
        }
    });

    searchInput.addEventListener("input", renderTasks);

    document.querySelectorAll(".filter-btn").forEach(function (button) {
        button.addEventListener("click", function () {
            currentFilter = button.dataset.filter || "all";

            document.querySelectorAll(".filter-btn").forEach(function (btn) {
                btn.classList.toggle("active", btn === button);
            });

            renderTasks();
        });
    });

    $("clearCompletedBtn").addEventListener("click", function () {
        const oldLength = tasks.length;

        tasks = tasks.filter(function (task) {
            return !task.completed;
        });

        if (tasks.length === oldLength) {
            showMessage(formMessage, "No completed tasks to clear.");
            return;
        }

        saveTasks();
        renderTasks();
        showMessage(formMessage, "Completed tasks cleared.");
    });

    // DARK MODE
    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);

        $("themeBtn").textContent = theme === "dark"
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";

        $("themeBtn").setAttribute(
            "aria-pressed",
            String(theme === "dark")
        );

        try {
            localStorage.setItem("taskflow_theme", theme);
        } catch (error) {
            // Theme works for the current page session.
        }
    }

    let initialTheme = "light";

    try {
        initialTheme = localStorage.getItem("taskflow_theme") || "light";
    } catch (error) {
        initialTheme = "light";
    }

    setTheme(initialTheme);

    $("themeBtn").addEventListener("click", function () {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        setTheme(currentTheme === "dark" ? "light" : "dark");
    });

    // FETCH API
    $("importBtn").addEventListener("click", async function () {
        const button = $("importBtn");

        button.disabled = true;
        showMessage(apiMessage, "Loading demo tasks...");

        try {
            const response = await fetch(
                "https://jsonplaceholder.typicode.com/todos?_limit=5"
            );

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const data = await response.json();

            data.forEach(function (item) {
                tasks.push({
                    id: makeId(),
                    title: item.title,
                    category: "Other",
                    priority: "Medium",
                    dueDate: "",
                    completed: Boolean(item.completed)
                });
            });

            saveTasks();
            renderTasks();
            showMessage(apiMessage, "Demo tasks imported successfully!");
        } catch (error) {
            showMessage(
                apiMessage,
                "Could not import tasks. Check your internet connection."
            );
        } finally {
            button.disabled = false;
        }
    });

    loadTasks();
    updateDate();
    renderTasks();
});
