const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store the hashed password directly
  role: { type: String, enum: ["admin", "user"], default: "user" }, // Add role field
});

module.exports = mongoose.model("User", userSchema);
