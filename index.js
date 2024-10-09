require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require("cors")

// const router = express.Router();
const { getAssignments, acceptAssignment, rejectAssignment } = require('./controllers/adminController');
const { authMiddleware, adminMiddleware } = require('./middlewares/authMiddleware');
const { register, login, uploadAssignment, getAdmins } = require('./controllers/userController');

//connection to db
const port = process.env.PORT || 5000
const app = express()

mongoose.connect(process.env.DB_URL)
    .then(res => {
        app.listen(port)
        console.log(`Database connected,Server running on ${port}`);
    })
    .catch(err => console.log(err))
    
//middle ware
app.use(express.json());
app.use(cors())

// Defult Routes
app.post('/register', register);
app.post('/login', login);

//User Routes
app.post('/upload', authMiddleware, uploadAssignment);
app.get('/admins', authMiddleware, getAdmins);

// Admin Routes
app.get('/assignments', authMiddleware, adminMiddleware, getAssignments);
app.post('/assignments/:id/accept', authMiddleware, adminMiddleware, acceptAssignment);
app.post('/assignments/:id/reject', authMiddleware, adminMiddleware, rejectAssignment);
