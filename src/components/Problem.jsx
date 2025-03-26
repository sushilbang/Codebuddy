import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { data } from "@/data/data";
import { problems } from "@/data/problems";
import Solution from "@/components/Solution";
import Analysis from "@/components/Analysis";
import Navbar from "@/components/Navbar";
import "@/styles/styles.css";

const Problem = () => {
    const { problemid } = useParams();
    const problem = data.find(problem => problem.problemid.toString() === problemid);
    const title = problems.find(problem => problem.problemid.toString() === problemid)?.title;

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "problem"; // Default to "problem"

    if (!problem) {
        return <p className="text-center text-red-500 font-semibold mt-4">Problem not found</p>;
    }

    return (
        <div>
            <div className="text-center text-2xl font-semibold bg-gray-800 text-white p-4">
                {title}
            </div>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
                <Navbar activeTab={activeTab} setSearchParams={setSearchParams} problemid={problemid} />
                
                {/* Content Sections */}
                <div className="p-4">
                    {activeTab === "problem" && (
                        <div dangerouslySetInnerHTML={{ __html: problem.content }} />
                    )}
                    {activeTab === "solution" && (
                        <Solution problemid={problemid} />
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
