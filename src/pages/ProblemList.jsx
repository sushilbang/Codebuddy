import { Link } from "react-router-dom";
import { problems } from "@/data/problems";
import ProfileMenu from "@/components/ProfileMenu";

const ProblemList = () => {
  return (
    <div className="mx-auto p-6 rounded-lg relative">
      <div className="absolute top-4 right-4">
        <ProfileMenu />
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Problem List</h1>
        <ul className="space-y-3">
          {problems.map((problem) => (
            <li key={problem.problemid} className="bg-gray-100 p-3 rounded-md shadow-sm hover:bg-gray-200 transition duration-200">
              <Link 
                to={`/problem/${problem.problemid}`} 
                className="text-blue-600 hover:underline font-medium"
              >
                {problem.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProblemList;
