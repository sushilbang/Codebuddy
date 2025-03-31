const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Groq = require("groq-sdk");
const User = require("../models/User");
const Submission = require("../models/Submissions");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const JUDGE0_URL = "http://127.0.0.1:2358"; // Self-hosted Judge0
const problems = require("../../src/data/problems");

const UPLOAD_FOLDER = path.join(__dirname, "../uploads");
const TESTCASE_FOLDER = path.join(__dirname, "../testcases");
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(TESTCASE_FOLDER, { recursive: true });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const upload = multer({ dest: UPLOAD_FOLDER });

// Extract test cases
const extractTestcases = (problemId) => {
    const zipPath = path.join(TESTCASE_FOLDER, `problem_${problemId}.zip`);
    if (!fs.existsSync(zipPath)) return [];

    const zip = new (require("adm-zip"))(zipPath);
    const inFiles = zip.getEntries().filter(e => e.entryName.endsWith(".in"));
    const outFiles = zip.getEntries().filter(e => e.entryName.endsWith(".out"));

    if (inFiles.length !== outFiles.length) return [];

    return inFiles.map((inFile, i) => ({
        input: zip.readAsText(inFile).trim(),
        expected_output: zip.readAsText(outFiles[i]).trim()
    }));
};

// Submit code to Judge0
const submitCode = async (source_code, input, language_id) => {
    try {
        const { data } = await axios.post(`${JUDGE0_URL}/submissions`, {
            source_code, language_id, stdin: input,
            cpu_time_limit: 1, memory_limit: 512000
        }, { headers: { "Content-Type": "application/json" } });
        return data.token;
    } catch (error) {
        console.error("Submission error:", error);
        return null;
    }
};

// Get submission result
const getSubmissionResult = async (token) => {
    for (let i = 0; i < 15; i++) {
        const { data } = await axios.get(`${JUDGE0_URL}/submissions/${token}`, { params: { base64_encoded: "false" } });
        if (data.status?.id === 1 || data.status?.id === 2) {
            await new Promise(res => setTimeout(res, 2000));
        } else {
            return data;
        }
    }
    return null;
};

// Process test case
const processTestCase = async (testcase, source_code, language_id) => {
    const token = await submitCode(source_code, testcase.input, language_id);
    if (!token) return { ...testcase, actual_output: "", status: "Submission Failed", passed: false };

    const result = await getSubmissionResult(token);
    if (!result) return { ...testcase, actual_output: "", status: "Error", passed: false };

    const output = result.stdout?.trim() || result.compile_output || result.stderr || "";
    return {
        ...testcase,
        actual_output: output,
        status: result.status.description,
        passed: testcase.expected_output === output
    };
};

// **AI Analysis Function**
const analyzeCode = async (problem, code, language, passedCount, totalCount) => {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `You are a code analysis AI. Your job is to review code and provide feedback. Provide the feedback in the following order:  

                1) Time complexity analysis  
                2) Space complexity analysis  

                Then, provide feedback in points regarding whether the user is going in right redirection or not and how he can improve his code's time and space complexity. Give only plain text and small answer.
                ` 
            },
                { role: "user", content: `This is the code that I wrote for the problem: ${problem} of CSES Problem Set. Analyze the following ${language} code:\n\n${code}` }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return response.choices[0]?.message?.content || "No analysis available.";
    } catch (error) {
        console.error("Groq API error:", error);
        return "Error analyzing code.";
    }
};

// **Submission API with Code Analysis**
router.post("/submit", upload.single("codeFile"), authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId, languageId, code } = req.body;
        if (!problemId || !languageId) return res.status(400).json({ error: "Missing required fields" });

        const source_code = req.file ? fs.readFileSync(req.file.path, "utf-8") : code;
        const testcases = extractTestcases(problemId);
        if (!testcases.length) return res.status(400).json({ error: "No valid test cases found" });

        // Run code against all test cases
        const results = await Promise.all(testcases.map(tc => processTestCase(tc, source_code, languageId)));

        // Count passed test cases
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        // get the problem
        const problemList = problems.problems;
        const problem = problemList.find((p) => Number(p.problemid) === Number(problemId));
        const title = problem.title;
        // AI Analysis
        const analysis = await analyzeCode(title, source_code, languageId, passedCount, totalCount);
        // Summary
        const summary = `Passed ${passedCount} out of ${totalCount} test cases.`;
        // **Save submission to database**
        const submission = new Submission({
            userId,
            problemId,
            languageId,
            sourceCode: source_code,
            results,
            passedCount,
            totalCount,
            analysis,
            summary,
        });
        await submission.save();

        // **Mark problem as solved if all test cases pass**
        if (passedCount === totalCount) {
            const user = await User.findById(userId);
            if (user) await user.addSolvedProblem(problemId);
        }

        res.json({
            summary: `${passedCount}/${totalCount} test cases passed`,
            details: results,
            analysis
        });

    } catch (error) {
        console.error("Submission API error:", error);
        res.status(500).json({ error: "Submission processing failed" });
    }
});

// router.post("/check", async (req, res) => {
//     try {
//         const problemId = 1;
//         const problemList = problems.problems;
//         console.log(problemList);
//         const problem = problemList.find((p) => Number(p.problemid) === Number(problemId));
//         // AI Analysis
//         console.log(problem.title);
//         // const analysis = await analyzeCode(problem, source_code, languageId, passedCount, totalCount);
//     } catch (error) {
//         console.error("Submission API error:", error);
//         res.status(500).json({ error: "Kuch to error hua" });
//     }
// })

router.get("/latest/:problemid", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemid } = req.params;

        const latestSubmission = await Submission.findOne({ userId, problemId: problemid })
            .sort({ createdAt: -1 });

        if (!latestSubmission) {
            return res.status(404).json({ message: "No submissions found." });
        }

        res.json(latestSubmission);
    } catch (error) {
        console.error("Error fetching latest submission:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

router.get("/allSubmissions", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id;
        const submissions = await Submission.find({userId});

        res.status(200).json({submissions});
    } catch (error) {
        console.error("Error fetching all submission:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

  

// router.get("/getSubmissions", authMiddleware,async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const user = await User.findById(userId);
//         if(!user) {
//             return res.status(200).json("User not found");
//         }
//         const sub_count = user.submissions.length;
//         return res.status(200).json({sub_count});
//     } catch (error) {
//         console.error("Submission API error:", error);
//         res.status(500).json({ error: "Did not got submission" });
//     }
// })

module.exports = router;
