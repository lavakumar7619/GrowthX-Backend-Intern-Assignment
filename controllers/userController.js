const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Assignment = require('../models/assignmentModel');

// Register user (user or admin)
exports.register = async (req, res) => {
  const { userEmail, userName, password, isAdmin = false } = req.body;

  // Validate input fields
  if (!userEmail || !password || !userName) {
    return res.status(400).json({ error: 'Email, username, and password are required' });
  }
  if (userName.length < 4) {
    return res.status(400).json({ error: 'Username must be at least 4 characters long' });
  }
  if (!validator.isEmail(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  // Validate password strength (min 8 characters, 1 uppercase, 1 number, 1 special character)
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character',
    });
  }

  try {
    // Check if the user already exists by email or username
    const existingUser = await User.findOne({ $or: [{ userEmail }, { userName }] });
    if (existingUser) {
      // If the username is already taken, return a specific message
      if (existingUser.userName === userName) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // If the email is already taken, return a specific message
      if (existingUser.userEmail === userEmail) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userEmail, userName, password: hashedPassword, isAdmin });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: 'User registration failed' });
  }
};

// Login user (user or admin)
exports.login = async (req, res) => {
  const { userEmail, password } = req.body;

  // Validate input fields
  if (!userEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (!validator.isEmail(userEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  try {
    // Check if the user exists
    const user = await User.findOne({ userEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
// Upload assignment
exports.uploadAssignment = async (req, res) => {
  const { task, admin } = req.body;
  // Validate if task and admin fields are provided
  if(!req.user.id){
    return res.status(400).json({error:"UserID is required, Token is missing"})
  }
  if (!task || !admin) {
    return res.status(400).json({ error: 'Task name and Admin name are required' });
  }
  try {
    // Find the admin by email
    const adminData = await User.findOne({ userName: admin, isAdmin: true });

    if (!adminData) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Check if the assignment already exists
    const existingAssignment = await Assignment.findOne({
      userId: req.user.id,
      task,
      admin: adminData._id
    });

    if (existingAssignment) {
      if (existingAssignment.status === 'Accepted' || existingAssignment.status === 'Rejected') {
        return res.status(400).json({ error: 'Cannot update an assignment that is already accepted or rejected' });
      }
      // If assignment exists, update it
      existingAssignment.task = task; 
      await existingAssignment.save();
      return res.status(200).json({ message: 'Assignment already exists, has been updated' });
    }

    // Prevent self-assignment by checking if the userId matches the admin's ID
    if (req.user.id === adminData._id.toString()) {
      return res.status(403).json({ error: 'You cannot upload an assignment for yourself' });
    }

    const assignment = new Assignment({
      userId: req.user.id,
      task,
      admin: adminData._id 
    });

    await assignment.save();
    res.status(201).json({ message: 'Assignment uploaded successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Assignment upload failed' });
  }
};



// Fetch all admins
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('userName');
    const userName = admins.map(admin => admin.userName);
    res.json(userName);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};
