const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemId: { type: String, required: true },
  languageId: { type: Number, required: true },
  sourceCode: { type: String, required: true },
  results: { type: Array, default: [] }, // Store test case results
  passedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  analysis: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  summary: {type: String},
});

module.exports = mongoose.model("Submission", submissionSchema);
