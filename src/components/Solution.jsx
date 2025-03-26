import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

// Define API base URL from environment or default
const API_BASE_URL = 'http://localhost:5000';

// Language options with their corresponding Judge0 language IDs
const languageOptions = [
  { id: 54, name: "C++" },
  { id: 71, name: "Python" },
];

const Solution = ({ problemid, activeTab }) => {
  // State management
  const [solution, setSolution] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle code submission
  const handleSubmission = async (event) => {
    event.preventDefault();
    // Validation checks
    if (!selectedLanguage) {
      setError("Please select a programming language.");
      return;
    }

    if (solution.trim() === "" && !selectedFile) {
      setError("Please enter a solution or upload a file.");
      return;
    }

    // Reset previous states
    setError(null);
    setIsSubmitting(true);

    // Prepare form data
    const formData = new FormData();
    formData.append("problemId", problemid);
    formData.append("languageId", selectedLanguage.id);
    
    // Append either file or code text
    if (selectedFile) {
      formData.append("codeFile", selectedFile);
    } else {
      formData.append("code", solution);
    }

    try {
      // Submission fetch with error handling
      const response = await fetch(`${API_BASE_URL}/api/submissions/submit`, {
        method: "POST",
        body: formData,
      });
      
      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Submission failed: ${errorText || response.statusText}`);
      }
      
      // Parse successful response
      const data = await response.json();
      setSubmissionResult(data);
      
      // Clear form after successful submission (but stay on solution tab)
      setSolution("");
      setSelectedFile(null);
      setSelectedLanguage(null);
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File input change handler
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    
    // If a file is selected, clear the text solution
    if (file) {
      setSolution("");
    }
  };

  return (
    <div className="text-gray-700 p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submit Your Solution</h2>

      {/* Language Selection Dropdown */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Language</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start"
            >
              {selectedLanguage ? selectedLanguage.name : "Choose Programming Language"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {languageOptions.map((lang) => (
              <DropdownMenuItem
                key={lang.id}
                onSelect={() => setSelectedLanguage(lang)}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Code Input Textarea */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Your Solution</label>
        <textarea
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="10"
          placeholder="Enter your solution here..."
          value={solution}
          onChange={(e) => {
            setSolution(e.target.value);
            // Clear file if user starts typing
            if (selectedFile) setSelectedFile(null);
          }}
          disabled={!!selectedFile}
        />
      </div>

      {/* File Upload Section */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="file"
          id="codeFileUpload"
          className="hidden"
          onChange={handleFileChange}
          accept=".cpp,.py" // Limit to supported file types
        />
        <label 
          htmlFor="codeFileUpload" 
          className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md border border-blue-300 hover:bg-blue-100"
        >
          Upload Code File
        </label>
        {selectedFile && (
          <span className="text-sm text-gray-600">
            {selectedFile.name}
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Submission Button */}
      <button
        onClick={(e) => handleSubmission(e)}
        disabled={isSubmitting}
        className={`w-full py-3 rounded-md text-white font-bold ${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Solution'}
      </button>

      {/* Submission Result */}
      {submissionResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-md">
          <h3 className="font-bold text-green-800 mb-2">Submission Results</h3>
          <pre className="whitespace-pre-wrap text-green-700">{JSON.stringify(submissionResult, null, 2)}</pre>
          
          {/* You can format this better based on your actual API response structure */}
          {submissionResult.stdout && (
            <div className="mt-4">
              <h4 className="font-semibold">Output:</h4>
              <pre className="bg-gray-100 p-2 rounded">{submissionResult.stdout}</pre>
            </div>
          )}
          
          {submissionResult.stderr && (
            <div className="mt-4 text-red-600">
              <h4 className="font-semibold">Errors:</h4>
              <pre className="bg-red-50 p-2 rounded">{submissionResult.stderr}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Solution;