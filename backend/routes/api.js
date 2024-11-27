const express = require('express');
const { verifyToken } = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');
const router = express.Router();
const SECRET_KEY = 'your-secret-key-here';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Middleware to check if the user is an Admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Create a new user (Admin only)
router.post('/users', verifyToken, isAdmin, async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Ensure role is valid
    if (!['Admin', 'User'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Admin or User.' });
    }

    const newUser = new User({
      username,
      password,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post('/admins', verifyToken, isAdmin, async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const newAdmin = new User({
        username,
        password,
        role: 'Admin',
      });
  
      await newAdmin.save();
      res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  router.post('/users/:userId/remove-controls', verifyToken, isAdmin, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's permissions or role
      user.role = 'User'; // Downgrade to a normal user
      await user.save();
  
      res.status(200).json({ message: 'User controls removed successfully', user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
    
// Upgrade a user to Admin (Admin only)
router.patch('/users/:userId/upgrade', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'User is already an Admin.' });
    }

    user.role = 'Admin';
    await user.save();

    res.status(200).json({ message: 'User upgraded to Admin successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a new team (Admin only)
router.post('/teams', verifyToken, isAdmin, async (req, res) => {
    const { name, permissions } = req.body;
  
    try {
      // Ensure the permissions structure includes full access for Manager
      const defaultPermissions = {
        Manager: ["manageTasks", "manageFiles", "createReports", "assignTasks", "viewUsers", "manageSettings", "approveRequests"],  // Add full access for Manager
        Admin: ["manageTasks", "manageFiles", "createReports", "assignTasks", "viewUsers", "manageSettings", "approveRequests"],  // Admin will also get full access
        Member: ["viewTasks", "uploadFiles"]  // Members have restricted access
      };
  
      // Use default permissions if not provided in the request
      const teamPermissions = permissions || defaultPermissions;
  
      const team = new Team({
        name,
        permissions: teamPermissions,
        createdBy: req.user._id,
      });
  
      await team.save();
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

// Add a user to a team
router.post('/teams/:teamId/members', verifyToken, isAdmin, async (req, res) => {
  const { userId, role } = req.body;
  const { teamId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user is already a member of the team
    const isMember = team.members.find((member) => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this team.' });
    }

    team.members.push({ user: userId, role });
    user.teams.push(teamId);

    await team.save();
    await user.save();

    res.status(200).json({ message: 'User added to team', team });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all teams (Admin can view all teams)
router.get('/teams', verifyToken, isAdmin, async (req, res) => {
  try {
    const teams = await Team.find().populate('members.user');
    res.status(200).json(teams);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the hashed password with the provided password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Create a JWT token
      const token = jwt.sign(
        { _id: user._id, username: user.username, role: user.role }, // Payload
        SECRET_KEY, // Secret key for signing the token
        { expiresIn: '1h' } // Expiry time (1 hour in this case)
      );
  
      // Check if the user is an admin or a regular user and send the appropriate message
      let loginMessage = '';
      if (user.role === 'Admin') {
        loginMessage = 'Admin login successful';
      } else {
        loginMessage = 'User login successful';
      }
  
      // Send the token and the appropriate success message
      res.status(200).json({ message: loginMessage, token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
module.exports = router;
