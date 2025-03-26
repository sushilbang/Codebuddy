import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Problem from "./components/Problem";
import ProblemList from "./components/ProblemList";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProblemList />} />
        <Route path="/problem/:problemid" element={<Problem />} />
      </Routes>
    </Router>
  );
}

export default App;
