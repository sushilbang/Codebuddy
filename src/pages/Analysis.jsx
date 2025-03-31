import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:5000";

const Analysis = ({ problemid }) => {
  const [submissionData, setSubmissionData] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the latest submission analysis from the backend
  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/submissions/latest/${problemid}`, {
        method: "GET",
        credentials: "include", // Include authentication cookies
      });

      if (!response.ok) {
        throw new Error("Failed to fetch submission data");
      }

      const data = await response.json();
      setSubmissionData(data);

      // Generate analysis
      if (data.results) {
        const totalTests = data.results.length;
        const passedTests = data.results.filter((test) => test.passed).length;
        const passRate = ((passedTests / totalTests) * 100).toFixed(2);

        setAnalysisResult(
          `Performance: ${passRate}%\n\nAnalysis: ${data.analysis || "No detailed analysis available."}`
        );
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching submission data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch submission data when the component mounts or when `problemid` changes
  useEffect(() => {
    fetchSubmissionData();
  }, [problemid]);

  return (
    <div className="text-gray-700 p-4">
      <h2 className="text-2xl font-bold mb-4">Performance Analysis</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading analysis...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : submissionData ? (
        <div className="space-y-4">
          {/* Submission Summary */}
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Submission Summary</h3>
            <p>{submissionData.summary || "No summary available."}</p>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
            <pre className="whitespace-pre-wrap">{analysisResult}</pre>
          </div>

          {/* Test Case Details */}
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Test Case Details</h3>
            {submissionData.results?.map((testCase, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${
                  testCase.passed ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"
                }`}
              >
                <p className="font-bold">
                  Test Case {index + 1}:
                  <span className={testCase.passed ? "text-green-700" : "text-red-700"}>
                    {testCase.passed ? " Passed" : " Failed"}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No submissions found. Submit a solution to view analysis.</div>
      )}
    </div>
  );
};

export default Analysis;
