import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { data } from "@/data/data";
import { problems } from "@/data/problems";
import Solution from "@/components/Solution";
import Analysis from "@/components/Analysis";
import "@/styles/styles.css";

const Problem = () => {
    const { problemid } = useParams();
    const problem = data.find(problem => problem.problemid.toString() === problemid);
    const title = problems.find(problem => problem.problemid.toString() === problemid).title;
    const [activeTab, setActiveTab] = useState("problem");

    if (!problem) {
        return <p className="text-center text-red-500 font-semibold mt-4">Problem not found</p>;
    }

    return (
        <div>
            <div className="text-center text-2xl font-semibold bg-gray-800 text-white p-4">
                {title}
            </div>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
                {/* Navbar */}
                <div className="flex justify-around bg-gray-100 p-3 rounded-t-lg shadow-md">
                    {["problem", "solution", "analysis"].map((tab) => (
                        <button 
                            key={tab}
                            className={`w-1/3 text-center py-2 font-medium transition duration-200 ${
                                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === "problem" ? "Problem" : tab === "solution" ? "Solution Submission" : "Analysis"}
                        </button>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="p-4">
                    {activeTab === "problem" && (
                        <div dangerouslySetInnerHTML={{ __html: problem.content }} />
                    )}
                    {activeTab === "solution" && (
                        <Solution problemid={problemid} activeTab={activeTab} />
                    )}
                    {activeTab === "analysis" && (
                        <Analysis problemid={problemid} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Problem;