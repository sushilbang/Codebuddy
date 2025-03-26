import fs from "fs/promises";
import { extractTestCases, executeTestCases, validateLanguageId } from "../services/codeEvaluationService.js";

export const evaluateSubmission = async (req, res) => {
  try {
    let code;
    if (req.file) {
      code = await fs.readFile(req.file.path, "utf8");
      await fs.unlink(req.file.path); // Cleanup uploaded file
    } else {
      code = req.body.code;
    }

    const { languageId, problemId } = req.body;

    // Convert languageId to a number
    const parsedLanguageId = Number(languageId);
    if (!validateLanguageId(parsedLanguageId)) {
      return res.status(400).json({ error: "Invalid language ID" });
    }

    // Extract test cases for the given problem
    const testCases = await extractTestCases(problemId);
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ error: "No test cases found for the problem" });
    }

    // Execute test cases
    const results = await executeTestCases(code, parsedLanguageId, testCases);

    res.json({
      success: true,
      problemId,
      results,
    });

  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: error.message || "Error evaluating submission" });
  }
};
