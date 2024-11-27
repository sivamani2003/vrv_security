import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "", // New field for role
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // React Router's hook for navigation

  const toggleAuthMode = () => setIsLogin(!isLogin);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const baseURL = "http://localhost:5002";
    const endpoint = isLogin ? `${baseURL}/api/auth/login` : `${baseURL}/api/auth/signup`;

    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role, // Include role during signup
        };

    try {
      const response = await axios.post(endpoint, payload);
      setMessage(response.data.message || "Success!");

      if (isLogin) {
        // Save the token (if returned by the backend)
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userRole", response.data.role);  // Save the role
        navigate("/home"); // Change '/home' to your desired route
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl shadow-lg rounded-lg bg-white overflow-hidden">
        {/* Left Section */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-center items-center p-10">
          <h2 className="text-4xl font-bold mb-4">
            {isLogin ? "Welcome Back!" : "Join Us Today!"}
          </h2>
          <p className="text-lg text-center">
            {isLogin
              ? "Login to explore our exclusive features."
              : "Sign up and unlock amazing benefits tailored for you."}
          </p>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-700 text-center">
            {isLogin ? "Login to Your Account" : "Create an Account"}
          </h2>
          <p className="text-center text-gray-500 mt-2">
            {isLogin
              ? "Access your personalized dashboard"
              : "Let's set up your account in a few steps."}
          </p>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500 placeholder-transparent"
                  placeholder="Full Name"
                  required
                />
                <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all pointer-events-none transform -translate-y-6 scale-75 origin-left focus-within:-translate-y-6 focus-within:scale-75">
                  Full Name
                </label>
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500 placeholder-transparent"
                placeholder="Email Address"
                required
              />
              <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all pointer-events-none transform -translate-y-6 scale-75 origin-left focus-within:-translate-y-6 focus-within:scale-75">
                Email Address
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500 placeholder-transparent"
                placeholder="Password"
                required
              />
              <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all pointer-events-none transform -translate-y-6 scale-75 origin-left focus-within:-translate-y-6 focus-within:scale-75">
                Password
              </label>
            </div>
            {/* Add role input only for signup */}
            {!isLogin && (
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-3 border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="" disabled>Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <label className="absolute left-3 top-3 text-gray-500 text-sm transition-all pointer-events-none transform -translate-y-6 scale-75 origin-left focus-within:-translate-y-6 focus-within:scale-75">
                  Role
                </label>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 shadow-md"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          {message && (
            <p className="mt-4 text-center text-red-500">{message}</p>
          )}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={toggleAuthMode}
                className="text-indigo-500 font-semibold hover:underline"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
