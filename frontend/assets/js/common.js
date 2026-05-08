axios.defaults.baseURL = "http://localhost:3000";

// Attach token automatically to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});