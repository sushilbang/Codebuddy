const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");

const app = express();
const PORT = 5000;
const JUDGE0_URL = "http://127.0.0.1:2358"; // Self-hosted Judge0

const UPLOAD_FOLDER = path.join(__dirname, "uploads");
const TESTCASE_FOLDER = path.join(__dirname, "testcases");
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
fs.mkdirSync(TESTCASE_FOLDER, { recursive: true });

app.use(cors());
app.use(express.json());
const upload = multer({ dest: UPLOAD_FOLDER });

const extractTestcases = (problemId) => {
    const zipPath = path.join(TESTCASE_FOLDER, `problem_${problemId}.zip`);
    if (!fs.existsSync(zipPath)) return [];

    const zip = new AdmZip(zipPath);
    const inFiles = zip.getEntries().filter(e => e.entryName.endsWith(".in"));
    const outFiles = zip.getEntries().filter(e => e.entryName.endsWith(".out"));
    
    if (inFiles.length !== outFiles.length) return [];

    return inFiles.map((inFile, i) => ({
        input: zip.readAsText(inFile).trim(),
        expected_output: zip.readAsText(outFiles[i]).trim()
    }));
};

const submitCode = async (source_code, input, language_id) => {
    try {
        const { data } = await axios.post(`${JUDGE0_URL}/submissions`, {
            source_code, language_id, stdin: input
        }, { headers: { "Content-Type": "application/json" } });
        return data.token;
    } catch (error) {
        console.error("Submission error:", error);
        return null;
    }
};

const getSubmissionResult = async (token) => {
    for (let i = 0; i < 15; i++) {
        const { data } = await axios.get(`${JUDGE0_URL}/submissions/${token}`, { params: { base64_encoded: "false" } });
        const status = data.status?.id;
        if (status === 1 || status === 2) await new Promise(res => setTimeout(res, 2000));
        else return data;
    }
    return null;
};

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

app.post("/api/submissions/submit", upload.single("codeFile"), async (req, res) => {
    try {
        const { problemId, languageId, code } = req.body;
        if (!problemId || !languageId) return res.status(400).json({ error: "Missing required fields" });
        
        const source_code = req.file ? fs.readFileSync(req.file.path, "utf-8") : code;
        const testcases = extractTestcases(problemId);
        if (!testcases.length) return res.status(400).json({ error: "No valid test cases found" });
        
        const results = await Promise.all(testcases.map(tc => processTestCase(tc, source_code, languageId)));
        const passedCount = results.filter(r => r.passed).length;
        
        res.json({ summary: `${passedCount}/${results.length} test cases passed`, details: results });
    } catch (error) {
        console.error("Submission API error:", error);
        res.status(500).json({ error: "Submission processing failed" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
