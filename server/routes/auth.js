const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");

// Register
router.post('/register', async (req, res) => {
    // console.log("Register route hit");
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const user = new User({ email, password });
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
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

        res.json({ token });
    } catch (error) {
        res.status(400).json({message: error.message});
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