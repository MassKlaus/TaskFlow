window.document.querySelector("#register-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        await axios.post("/api/auth/register", { fullName, email, password });
        alert("Registration successful! Please log in.");
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed: " + (error.response?.data?.error || "Unknown error"));
    }
});