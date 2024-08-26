import express from 'express';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import session from 'express-session';
import User from './models/users';
import bcrypt from 'bcryptjs';

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

const mongoURL = 'mongodb://localhost:27017/Mini-Project';

// MongoDB connection
mongoose.connect(mongoURL)
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
            return res.status(400).send('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
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
app.get('/user/dashboard', requireAuth, (req, res) => {
    if (req.session.userRole !== 'user') {
        return res.status(403).send('Access denied');
    }

    const today = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = today.toLocaleDateString('en-GB', options).replace(',', '');

    res.render('dashboard', {
        name: req.session.userName,
        email: req.session.userEmail,
        date: date
    }); 
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
                history: Math.floor(Math.random() * 101)
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

app.delete('/delete', async (req, res) => {
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

app.delete('/admin/delete-user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).send('User deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/admin/edit-user/:id', async (req, res) => {
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

app.put('/admin/edit-user/:id', async (req, res) => {
    const { id } = req.params;
    const { math, science, english, history } = req.body;

    try {
        await User.findByIdAndUpdate(id, {
            subjects: {
                math: parseInt(math),
                science: parseInt(science),
                english: parseInt(english),
                history: parseInt(history)
            }
        });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get("/", (req, res) => {
    res.render('login');
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/signup", (req, res) => {
    res.render('signup', { message: "" });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
