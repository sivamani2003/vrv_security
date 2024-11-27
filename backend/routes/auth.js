const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();
const Task = require("../models/Task"); 
// Signup Route
router.post("/signup", async (req, res) => {
  const { fullName, email, password, role = "user" } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = "mockToken"; // Replace with JWT or other token logic
    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Role and Status
router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { role, status } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role || user.role;
    user.status = status || user.status;

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User
router.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/task", async (req, res) => {
    const { title, description, assignedTo, dueDate, status } = req.body;
  
    try {
      // Validation: Ensure that all required fields are provided
      if (!title || !description || !assignedTo || !dueDate) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Create a new Task instance
      const newTask = new Task({
        title,
        description,
        assignedTo, // This should be a valid User ID
        dueDate,
        status: status || "Pending", // Default to "Pending" if no status provided
      });
  
      // Save the task to the database
      await newTask.save();
      res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
router.get("/tasks", async (req, res) => {
    try {
      // Fetch all tasks from the database
      const tasks = await Task.find().populate("assignedTo", "fullName email role");  // Optional: Populate assignedTo with relevant user details like fullName, email, etc.
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// Promote User to Admin
router.post("/promote-to-admin/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch the user making the request (admin) from the token (This part assumes you have JWT authentication in place)
      // For now, we are assuming that there is a mock token validation and an admin check (this should be replaced with actual logic)
      const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is sent in the Authorization header (e.g., "Bearer token")
  
      if (!token) {
        return res.status(401).json({ message: "Authorization required" });
      }
  
      // Mock admin check (replace with actual token decoding and validation)
      const isAdmin = token === "mockToken";  // Replace this with actual JWT decoding logic
      if (!isAdmin) {
        return res.status(403).json({ message: "Permission denied" });
      }
  
      // Find the user to be promoted
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Promote the user to admin
      user.role = "admin"; // Update the role to 'admin'
      await user.save();
  
      res.status(200).json({ message: "User promoted to admin successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router;
