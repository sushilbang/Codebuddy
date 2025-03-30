const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const Groq = require("groq-sdk");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const JUDGE0_URL = "http://127.0.0.1:2358"; // Self-hosted Judge0

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
const analyzeCode = async (code, language, passedCount, totalCount) => {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `You are a code analysis AI. Your job is to review code and provide feedback. Provide the feedback in the following order:  

                1) Time complexity analysis  
                2) Space complexity analysis  

                Then, provide feedback in points.  

                If all test cases have passed (${passedCount} === ${totalCount}), acknowledge that the solution works correctly but suggest possible optimizations in terms of time and space complexity. If the solution is already optimal, mention that explicitly.  

                If some test cases have failed (${passedCount} < ${totalCount}), first indicate that the solution is incorrect. Analyze possible reasons for failure, such as edge cases, incorrect logic, or inefficiencies. Then, suggest improvements with a focus on optimizing time and space complexity.  

                Give the response in plain text and only focus on performance improvements related to time and space complexity.
                ` 
            },
                { role: "user", content: `Analyze the following ${language} code:\n\n${code}` }
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
router.post("/submit",upload.single("codeFile"),  authMiddleware,async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId, languageId, code } = req.body;
        if (!problemId || !languageId) return res.status(400).json({ error: "Missing required fields" });

        const source_code = req.file ? fs.readFileSync(req.file.path, "utf-8") : code;
        const testcases = extractTestcases(problemId);
        if (!testcases.length) return res.status(400).json({ error: "No valid test cases found" });

        const results = await Promise.all(testcases.map(tc => processTestCase(tc, source_code, languageId)));
        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        // Call Groq AI for code analysis
        const analysis = await analyzeCode(source_code, languageId, passedCount, totalCount);
        if (passedCount === totalCount) {
            const user = await User.findById(userId); // Fetch user from DB
            if (user) {
                await user.addSolvedProblem(problemId); // Add solved problem if all test cases passed
            }
        }
        res.json({
            summary: `${passedCount}/${results.length} test cases passed`,
            details: results,
            analysis
        });

    } catch (error) {
        console.error("Submission API error:", error);
        res.status(500).json({ error: "Submission processing failed" });
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
