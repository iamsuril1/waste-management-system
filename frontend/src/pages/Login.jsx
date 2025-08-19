import React, { useState, useContext } from "react";
import api from "../utils/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password cannot be blank");
      return;
    }
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-2 text-center">Login</h2>
        <p className="text-gray-600 mb-6 text-center">
          Please fill out the following fields to login:
        </p>
        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={`w-full p-3 border rounded ${error && !form.email ? "border-red-500" : "border-gray-300"}`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`w-full p-3 border rounded ${error && !form.password ? "border-red-500" : "border-gray-300"}`}
          />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="h-4 w-4" />
            <label htmlFor="remember" className="text-gray-600 text-sm">Remember Me</label>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </p>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
