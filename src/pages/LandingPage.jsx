import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-b from-gray-200 to-gray-100 hero-section">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-blue-600">CodeBuddy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A powerful platform to enhance your coding skills with real-time execution, problem-solving, and efficiency analysis.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/features"
              className="px-8 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-blue-600">CodeBuddy</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Real-Time Code Execution",
                description: "Run your code instantly with our integrated Judge0 execution engine.",
                icon: "⚡",
              },
              {
                title: "Comprehensive Problem Set",
                description: "Access a wide variety of coding challenges and improve your problem-solving skills.",
                icon: "📚",
              },
              {
                title: "Performance Analysis",
                description: "Analyze your code’s efficiency and optimize it for better performance.",
                icon: "📊",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-t from-gray-200 to-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to <span className="text-blue-600">Start Coding</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join CodeBuddy today and become a better programmer with hands-on coding experience.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors"
          >
            Register Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="text-xl font-bold text-blue-600">CodeBuddy</Link>
              <p className="text-gray-600 mt-2">
                © {new Date().getFullYear()} CodeBuddy. All rights reserved.
              </p>
            </div>

            <div className="flex space-x-6">
              <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
