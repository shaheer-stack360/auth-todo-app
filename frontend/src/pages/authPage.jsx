import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/authProvider.jsx";
import { login, register } from "../../api/axios.js";

export default function AuthPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function switchTab(t) {
    setTab(t);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await login({
          username: form.username,
          password: form.password,
        });
        saveSession(form.username, res.data.access, res.data.refresh);
        navigate("/");
      } else {
        await register(form);
        setSuccess("Account created! You can now log in.");
        switchTab("login");
        setForm((prev) => ({ ...prev, password: "", confirm_password: "" }));
      }
    } catch (err) {
      const data = err.response?.data;
      if (!data) {
        setError("Something went wrong.");
      } else if (data.detail) {
        setError(data.detail);
      } else {
        setError(Object.values(data).flat().join(" "));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">✦ task</div>
        <p className="auth-subtitle">Your personal todo space</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Register
          </button>
        </div>

        {error && <div className="msg error">{error}</div>}
        {success && <div className="msg success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setField("username", e.target.value)}
              required
              autoFocus
            />
          </div>

          {tab === "register" && (
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
            />
          </div>

          {tab === "register" && (
            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) => setField("confirm_password", e.target.value)}
                required
              />
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : tab === "login"
                ? "Sign in →"
                : "Create account →"}
          </button>
        </form>
      </div>
    </div>
  );
}
