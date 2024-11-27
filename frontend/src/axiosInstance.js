// src/axiosInstance.js

import axios from "axios";

// Set up the base URL for the backend API
const axiosInstance = axios.create({
  baseURL: "http://localhost:5002/api/auth", // Update to match your backend's base URL
});

export default axiosInstance;
