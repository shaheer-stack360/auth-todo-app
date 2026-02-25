import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try refreshing the token once, then retry the original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem("refresh")
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          "http://localhost:8000/auth/token/refresh/",
          {
            refresh: localStorage.getItem("refresh"),
          },
        );
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original); // retry original request
      } catch {
        localStorage.clear();
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  },
);

export const login = (data) => api.post("/auth/login/", data);
export const register = (data) => api.post("/auth/register/", data);
export const logout = (refresh) => api.post("/auth/logout/", { refresh });

export const getTodos = () => api.get("/todos/");
export const createTodo = (data) => api.post("/todos/", data);
export const updateTodo = (id, data) => api.patch(`/todos/${id}/`, data);
export const deleteTodo = (id) => api.delete(`/todos/${id}/`);
