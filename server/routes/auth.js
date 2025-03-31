const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");

// Register
router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ error: "Email is already registered" });
    }

    try {
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({message: error.message});
    }
});


// Login
router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) throw new Error("User not found");

        const isMatch = await user.comparePassword(password);
        if(!isMatch) throw new Error("Invalid credentials");

        // Generate JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,  // Set `true` in production (HTTPS)
            sameSite: "Lax", // Adjust for cross-site requests if needed
            path: "/", // Ensure cookie applies to all routes
        });
        

        res.json({ token });
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

// Logout
router.post("/logout", authMiddleware, async (req, res) => {
    try {
        res.clearCookie("token", {
            path: '/'
        });
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "Logout failed", error: error.message });
    }
});



// Get user details
router.get("/me", authMiddleware, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if(!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
});

module.exports = router;