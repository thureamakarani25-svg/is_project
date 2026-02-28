import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post("http://127.0.0.1:8000/api/login/", formData)
            .then((res) => {
                alert("Login Successful, Token: " + res.data.token);
                localStorage.setItem("token", res.data.token);

                const role = res.data.role || res.data.user?.role;
                if (role) {
                    localStorage.setItem("role", role);
                }

                if (role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/user");
                }
            })
            .catch((err) => alert(err.response?.data?.error || "Login failed"));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
