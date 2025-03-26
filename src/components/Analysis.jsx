import React, { useState } from 'react';

const Analysis = ({ problemid }) => {
    const [analysisResult, setAnalysisResult] = useState("");

    const handleAnalysis = () => {
        setAnalysisResult(`Your solution for Problem ${problemid} has an estimated time complexity of O(n).`);
    };

    return (
        <div className="text-gray-700">
            <h2 className="text-xl font-bold mb-3">Performance Analysis</h2>
            <p>Analyze your solution efficiency and complexity here.</p>

            {analysisResult && (
                <div className="mt-4 p-3 border border-gray-300 rounded-md bg-gray-100">
                    <h3 className="text-lg font-semibold">Analysis Result:</h3>
                    <p>{analysisResult}</p>
                </div>
            )}
        </div>
    );
};

export default Analysis;
