require('dotenv').config(); // load .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const WeatherModel = require('./models/Weather.js');

const app = express();
app.use(express.json());
app.use(cors());

// ================= MongoDB CONNECTION =================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err.message));

// ================= API ROUTES =================

// SIGNUP
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await WeatherModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: "Error", error: "Email already exists" });
        }

        // ✅ Password validation (max 10 chars allowed)
        if (!password || password.length > 10) {
            return res.status(400).json({
                status: "Error",
                error: "Password must be 10 characters or less"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await WeatherModel.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            status: "Success",
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (err) {
        console.error("❌ Signup error:", err.message);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await WeatherModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "Error", error: "No record exists" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "Error", error: "Password is incorrect" });
        }

        res.json({
            status: "Success",
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error("❌ Login error:", err.message);
        res.status(500).json({ status: "Error", error: err.message });
    }
});

// GET all users (password excluded)
app.get('/weather', async (req, res) => {
    try {
        const allWeather = await WeatherModel.find().select("-password");
        res.json(allWeather);
    } catch (err) {
        console.error("❌ Fetch error:", err.message);
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
