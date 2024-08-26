// create-admin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/users';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/loginDB', {
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

const createAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash('adminpassword', 10); // Change 'adminpassword' to your preferred admin password
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: hashedPassword,
            role: 'admin',
            subjects: {
                math: 0,
                science: 0,
                english: 0,
                history: 0,
            },
        });

        await adminUser.save();
        console.log("Admin user created successfully");
    } catch (err) {
        console.error("Error creating admin user:", err);
    }
};

const run = async () => {
    await connectDB();
    await createAdmin();
    mongoose.connection.close();
};

run();
