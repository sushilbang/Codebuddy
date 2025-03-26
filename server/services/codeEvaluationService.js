// services/codeEvaluationService.js
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current module path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JUDGE0_API = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

// Enhanced test case extraction
export const extractTestCases = async (problemId) => {
  try {
    const zipPath = path.join(__dirname, `../../testCases/test-${problemId}.zip`);
    
    // Verify zip exists
    try {
      await fs.access(zipPath);
    } catch {
      throw new Error(`Test cases for problem ${problemId} not found`);
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    const testCases = [];

    // Validate and pair test cases
    const inputFiles = zipEntries
      .filter(entry => entry.entryName.match(/^input\d+\.txt$/i))
      .sort((a, b) => {
        const numA = parseInt(a.entryName.replace(/input(\d+)\.txt/i, '$1'));
        const numB = parseInt(b.entryName.replace(/input(\d+)\.txt/i, '$1'));
        return numA - numB;
      });

    for (const inputEntry of inputFiles) {
      const caseNum = inputEntry.entryName.replace(/input(\d+)\.txt/i, '$1');
      const outputEntry = zipEntries.find(e => 
        e.entryName.toLowerCase() === `output${caseNum}.txt`
      );

      if (!outputEntry) {
        console.warn(`No matching output file for ${inputEntry.entryName}`);
        continue;
      }

      testCases.push({
        input: zip.readAsText(inputEntry),
        expectedOutput: zip.readAsText(outputEntry).trim()
      });
    }

    if (testCases.length === 0) {
      throw new Error('No valid test cases found in the zip file');
    }

    return testCases;
  } catch (error) {
    console.error('Test case extraction failed:', error);
    throw new Error(`Failed to load test cases: ${error.message}`);
  }
};

// Robust test case execution
export const executeTestCases = async (code, languageId, testCases) => {
  if (!testCases || testCases.length === 0) {
    throw new Error('No test cases provided');
  }

  const results = [];
  let allPassed = true;

  // Process test cases sequentially to avoid rate limiting
  for (const [index, testCase] of testCases.entries()) {
    const caseNumber = index + 1;
    
    try {
      const startTime = Date.now();
      const response = await axios.post(
        `${JUDGE0_API}/submissions?wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.expectedOutput,
          cpu_time_limit: 5,
          memory_limit: 128000,
          enable_network: false, // For security
          redirect_stderr_to_stdout: true
        },
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_KEY,
            'X-RapidAPI-Host': new URL(JUDGE0_API).hostname,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout for API call
        }
      );

      const result = response.data;
      const executionTime = Date.now() - startTime;

      // Enhanced result validation
      const isSuccess = result.status?.id === 3;
      const outputMatches = isSuccess && 
        result.stdout?.trim() === testCase.expectedOutput;
      const hasError = result.stderr || result.compile_output;

      if (!outputMatches) allPassed = false;

      results.push({
        testCase: caseNumber,
        passed: outputMatches,
        status: result.status?.description || 'Unknown Status',
        actualOutput: result.stdout?.trim() || null,
        expectedOutput: testCase.expectedOutput,
        time: result.time ? `${result.time}s` : 'N/A',
        memory: result.memory ? `${result.memory} bytes` : 'N/A',
        compileOutput: result.compile_output,
        stderr: result.stderr,
        executionTime: `${executionTime}ms`
      });

    } catch (error) {
      console.error(`Test case ${caseNumber} execution failed:`, error);
      
      const errorDetails = error.response?.data || error.message;
      allPassed = false;
      
      results.push({
        testCase: caseNumber,
        passed: false,
        status: 'Execution Failed',
        error: typeof errorDetails === 'object' 
          ? JSON.stringify(errorDetails) 
          : errorDetails,
        executionTime: 'N/A'
      });

      // Continue with next test case even if one fails
    }
  }

  return {
    allPassed,
    testResults: results,
    summary: {
      total: testCases.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    }
  };
};

// Utility function to validate language ID
export const validateLanguageId = (languageId) => {
  const validLanguages = {
    71: 'Python',
    50: 'C',
    54: 'C++',
    62: 'Java',
    63: 'JavaScript'
  };
  return validLanguages[languageId] || false;
};