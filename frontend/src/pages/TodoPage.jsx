import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authProvider.jsx";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  logout,
} from "../../api/axios.js";

function Navbar({ username, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">✦ task</div>
      <div className="nav-right">
        <span className="nav-user">@{username}</span>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

function AddTodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onAdd({ title, description });
    setTitle("");
    setDesc("");
    setLoading(false);
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button
          className="btn-add"
          type="submit"
          disabled={loading || !title.trim()}
        >
          {loading ? "..." : "+ Add"}
        </button>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
      />
    </form>
  );
}

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDesc] = useState(todo.description);

  async function handleSave() {
    if (!title.trim()) return;
    await onUpdate(todo.id, { title, description });
    setEditing(false);
  }

  function handleCancel() {
    setTitle(todo.title);
    setDesc(todo.description);
    setEditing(false);
  }

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div
        className={`todo-check ${todo.completed ? "checked" : ""}`}
        onClick={() => onToggle(todo)}
      />

      {editing ? (
        <div className="edit-form">
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDesc(e.target.value)}
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="todo-body">
          <div className="todo-title">{todo.title}</div>
          {todo.description && (
            <div className="todo-desc">{todo.description}</div>
          )}
        </div>
      )}

      {!editing && (
        <div className="todo-actions">
          {!todo.completed && (
            <button className="btn-icon" onClick={() => setEditing(true)}>
              ✎
            </button>
          )}
          <button className="btn-icon danger" onClick={() => onDelete(todo.id)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function Filters({ active, onChange }) {
  return (
    <div className="filters">
      {["all", "active", "done"].map((f) => (
        <button
          key={f}
          className={`filter-btn ${active === f ? "active" : ""}`}
          onClick={() => onChange(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function TodoPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getTodos()
      .then((res) => setTodos(res.data))
      .catch(() => setError("Failed to load todos."))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(data) {
    const res = await createTodo(data);
    setTodos((prev) => [res.data, ...prev]);
  }

  async function handleToggle(todo) {
    const res = await updateTodo(todo.id, { completed: !todo.completed });
    setTodos((prev) => prev.map((t) => (t.id === res.data.id ? res.data : t)));
  }

  async function handleUpdate(id, data) {
    const res = await updateTodo(id, data);
    setTodos((prev) => prev.map((t) => (t.id === res.data.id ? res.data : t)));
  }

  async function handleDelete(id) {
    await deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleLogout() {
    try {
      await logout(localStorage.getItem("refresh"));
    } catch {}
    clearSession();
    navigate("/auth");
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
    return true;
  });

  const doneCount = todos.filter((t) => t.completed).length;

  return (
    <>
      <Navbar username={user} onLogout={handleLogout} />

      <div className="main">
        <div className="page-header">
          <div className="page-title">My Tasks</div>
          <div className="page-meta">
            {doneCount} of {todos.length} completed
          </div>
        </div>

        <AddTodoForm onAdd={handleAdd} />
        <Filters active={filter} onChange={setFilter} />

        {error && <div className="msg error">{error}</div>}

        {loading ? (
          <div className="spinner">
            <div className="spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-text">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </div>
          </div>
        ) : (
          <div className="todo-list">
            {filtered.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
