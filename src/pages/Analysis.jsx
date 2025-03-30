import React, { useState, useEffect } from 'react';

const Analysis = ({ problemid }) => {
    const [submissionData, setSubmissionData] = useState(null);
    const [analysisResult, setAnalysisResult] = useState("");

    // Function to fetch submission data from local storage
    const fetchSubmissionData = () => {
        const storedSubmissionData = localStorage.getItem(`submission_${problemid}`);
        if (storedSubmissionData) {
            const parsedData = JSON.parse(storedSubmissionData);
            setSubmissionData(parsedData);
        }
    };

    // Fetch submission data when component mounts
    useEffect(() => {
        fetchSubmissionData();
    }, [problemid]);

    // Generate analysis based on submission data
    useEffect(() => {
        if (submissionData) {
            const totalTests = submissionData.details.length;
            const passedTests = submissionData.details.filter(test => test.passed).length;
            const passRate = (passedTests / totalTests) * 100;
            const analysis = submissionData.analysis;

            setAnalysisResult(`Performance: ${passRate},

Analysis: ${analysis}    
            `);
        }
    }, [submissionData]);

    return (
        <div className="text-gray-700 p-4">
            <h2 className="text-2xl font-bold mb-4">Performance Analysis</h2>

            {submissionData ? (
                <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Submission Summary</h3>
                        <p>{submissionData.summary}</p>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
                        <pre className="whitespace-pre-wrap">{analysisResult}</pre>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Test Case Details</h3>
                        {submissionData.details.map((testCase, index) => (
                            <div 
                                key={index} 
                                className={`mb-2 p-2 rounded ${
                                    testCase.passed 
                                        ? 'bg-green-100 border-green-300' 
                                        : 'bg-red-100 border-red-300'
                                }`}
                            >
                                <p className="font-bold">
                                    Test Case {index + 1}: 
                                    <span className={testCase.passed ? 'text-green-700' : 'text-red-700'}>
                                        {testCase.passed ? ' Passed' : ' Failed'}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No submission data available. 
                    Submit a solution on the Solution page to see analysis.
                </div>
            )}
        </div>
    );
};

export default Analysis;