import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Clipboard, Check, XCircle, CheckCircle } from "lucide-react";
import { problems } from "@/data/problems";
import ProfileMenu from "@/components/ProfileMenu";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/submissions/allSubmissions", {
          withCredentials: true,
        });

        // Add status to each submission
        const submissionsWithStatus = response.data.submissions.map((submission) => ({
          ...submission,
          status: submission.passedCount === submission.results.length ? "Accepted" : "Wrong Answer",
        }));

        setSubmissions(submissionsWithStatus);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const getProblemTitle = (problemid) => {
    const problem = problems.find((p) => Number(p.problemid) === Number(problemid));
    return problem ? problem.title : "Unknown Problem";
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(selectedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Error copying code:", err));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4 px-8">
        <h2 className="text-2xl font-bold">Your Submissions</h2>
        <div className="absolute top-6 right-8">
          <ProfileMenu />
        </div>
      </div>
      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions found.</p>
      ) : (
        <ul className="space-y-3 px-8">
          {submissions.map((submission) => (
            <li
              key={submission._id}
              className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
            >
              <span className="font-medium">{getProblemTitle(submission.problemId)}</span>

              {/* Submission Status */}
              {submission.status === "Accepted" ? (
                <CheckCircle className="w-5 h-5 text-green-500" title="Accepted" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" title="Wrong Answer" />
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setSelectedCode(submission.sourceCode)}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-2xl p-6 rounded-lg shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Submission Code</h3>
                    <Button size="icon" variant="outline" onClick={copyToClipboard}>
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clipboard className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-gray-100 text-black p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap">
                    {selectedCode}
                  </pre>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Submissions;
