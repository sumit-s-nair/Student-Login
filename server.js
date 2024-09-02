import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import User from './models/users';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './project.env' })
const mongoUri = process.env.MONGO_URI;

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
const saltRounds = 10;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middlewares
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'testSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    if (req.session.userRole !== 'admin') {
        return res.redirect('/');
    }
    next();
}

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { message: 'Invalid password' });
        }

        // Set session variables
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        // Redirecting based on role
        return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', { message: 'Server error. Please try again later.' });
    }
});

// Simple auth check middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    next();
}

// Admin dashboard route
app.get('/admin/dashboard', requireAuth, async (req, res) => {
    if (req.session.userRole !== 'admin') {
        return res.status(403).send('Access denied');
    }

    try {
        const students = await User.find({ role: 'user' });

        const today = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = today.toLocaleDateString('en-GB', options).replace(',', '');

        res.render('dashboard-admin', {
            name: req.session.userName,
            email: req.session.userEmail,
            date: date,
            students: students
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// User dashboard route
app.get('/user/dashboard', requireAuth, async (req, res) => {
    if (req.session.userRole !== 'user') {
        return res.status(403).send('Access denied');
    }

    try {
        const today = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const date = today.toLocaleDateString('en-GB', options).replace(',', '');

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('dashboard', {
            name: user.name,
            email: user.email,
            date: date,
            math: user.subjects.math,
            science: user.subjects.science,
            english: user.subjects.english,
            webdev: user.subjects.webdev
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
});


// User signup route
app.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render('signup', { message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            subjects: {
                math: Math.floor(Math.random() * 101),
                science: Math.floor(Math.random() * 101),
                english: Math.floor(Math.random() * 101),
                webdev: Math.floor(Math.random() * 101)
            }
        });
        await newUser.save();

        res.sendFile(path.join(__dirname, 'public', 'signup-success.html'));
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.delete('/delete', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        await User.findByIdAndDelete(userId);

        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }

            res.clearCookie('connect.sid');
            res.status(200).send('Account deleted');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.delete('/admin/delete-user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/admin/edit-user/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('edit-user', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.put('/admin/edit-user/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { math, science, english, webdev } = req.body;

    if (math <= 100 && science <= 100 && english <= 100 && webdev <= 100) {
        try {
            const updatedUser = await User.findByIdAndUpdate(id, {
                'subjects.math': math,
                'subjects.science': science,
                'subjects.english': english,
                'subjects.webdev': webdev,
            }, { new: true });
    
            if (!updatedUser) {
                return res.status(404).send('User not found');
            }
    
            res.status(200).send('User marks updated successfully');
        } catch (error) {
            console.error('Error updating user marks:', error);
            res.status(500).send('Server error');
        }
    } else {
        res.status(400).send('Marks cannot be above 100');
    }
});

app.get("/", (req, res) => {
    res.render('login', { message: "" });
});

app.get("/login", (req, res) => {
    res.render('login', { message: "" });
});

app.get("/signup", (req, res) => {
    res.render('signup', { message: "" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
