import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState([]); // <-- array of error objects
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]); // Clear previous errors

    try {
      await axios.post(`${BASE_URL}/api/auth/register`, form);
      navigate("/login");
    } catch (err) {
      const res = err.response;

      if (res?.data?.errors) {
        // Express-validator errors (array of objects with 'msg')
        setErrors(res.data.errors);
      } else if (res?.data?.message || res?.data?.msg || res?.data?.error) {
        // General custom error message
        const msg = res.data.message || res.data.msg || res.data.error;
        setErrors([{ msg }]);
      } else {
        // Fallback message
        setErrors([{ msg: "Registration failed. Please try again." }]);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-100 to-emerald-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Register
        </h2>

        {/* Display all errors */}
        {errors.length > 0 && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md text-sm space-y-1">
            {errors.map((error, idx) => (
              <p key={idx}>{error.msg}</p>
            ))}
          </div>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
        >
          Register
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
