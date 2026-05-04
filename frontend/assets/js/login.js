window.document.querySelector("#login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const response = await axios.post("/api/auth/login", { email, password });
        const { token } = response.data;
        localStorage.setItem("token", token);
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed: " + (error.response?.data?.error || "Unknown error"));
    }
});

