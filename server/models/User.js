const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    submissions: { type: [String], default: [], validate: {
        validator: function (arr) {
            return new Set(arr).size === arr.length; // Ensure uniqueness
        },
        message: 'Submissions must be unique'
    }}
});

// Hash password before saving to database
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

// Function to add a solved problem (ensures uniqueness)
userSchema.methods.addSolvedProblem = async function(problemId) {
    if (!this.submissions.includes(problemId)) {
        this.submissions.push(problemId);
        await this.save();
    }
};

// compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;