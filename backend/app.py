import os
import zipfile
import requests
import time
import traceback
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, as_completed

app = Flask(__name__)

# Comprehensive CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",  # Next.js default
            "http://localhost:5173",  # Vite default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Content-Type", 
            "Authorization", 
            "Access-Control-Allow-Credentials"
        ]
    }
})

# Absolute paths for better reliability
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
TESTCASE_FOLDER = os.path.join(BASE_DIR, "testcases")
JUDGE0_URL = "http://127.0.0.1:2358"

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TESTCASE_FOLDER, exist_ok=True)

def extract_testcases(problem_id):
    """Fetch and extract test cases based on problem ID."""
    zip_path = os.path.join(TESTCASE_FOLDER, f"problem_{problem_id}.zip")

    # Debugging print statements
    print(f"Searching for test case file: {zip_path}")
    print(f"Testcase folder contents: {os.listdir(TESTCASE_FOLDER)}")

    if not os.path.exists(zip_path):
        print(f"Test case file not found: {zip_path}")
        return []

    testcases = []
    try:
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            # Print all files in the zip for debugging
            print("Files in zip:", zip_ref.namelist())

            # Find input and output files
            in_files = sorted([f for f in zip_ref.namelist() if f.endswith('.in')])
            out_files = sorted([f for f in zip_ref.namelist() if f.endswith('.out')])

            print(f"Input files: {in_files}")
            print(f"Output files: {out_files}")

            # Ensure matching input and output files
            if len(in_files) != len(out_files):
                print("Mismatch between input and output files")
                return []

            for in_file, out_file in zip(in_files, out_files):
                with zip_ref.open(in_file) as f_in, zip_ref.open(out_file) as f_out:
                    input_content = f_in.read().decode('utf-8').strip()
                    output_content = f_out.read().decode('utf-8').strip()

                    testcases.append({
                        'input': input_content,
                        'expected_output': output_content
                    })

        return testcases
    except Exception as e:
        print(f"Error extracting testcases: {e}")
        return []

def submit_code(source_code, input_data, language_id):
    """Submit code to Judge0 API."""
    headers = {"Content-Type": "application/json"}
    data = {
        "source_code": source_code,
        "language_id": int(language_id),  # Convert to int to avoid issues
        "stdin": input_data,
        "wait": True  # Wait for execution to complete
    }

    try:
        response = requests.post(
            f"{JUDGE0_URL}/submissions",
            json=data,
            headers=headers,
            timeout=30  # Increased timeout for long-running submissions
        )
        response.raise_for_status()
        return response.json().get("token")
    except Exception as e:
        print(f"Submission error: {e}")
        return None

def get_submission_result(token):
    """Retrieve submission result from Judge0 API."""
    try:
        response = requests.get(
            f"{JUDGE0_URL}/submissions/{token}",
            params={"base64_encoded": "false"},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()

        status_id = result.get("status", {}).get("id")

        if status_id in [6, 7]:  # Compilation or Runtime Error
            return {
                "status": "Error",
                "output": result.get("compile_output", "") or result.get("stderr", ""),
                "passed": False
            }

        if status_id == 3:  # Accepted
            return {
                "status": "Success",
                "output": result.get("stdout", "").strip() if result.get("stdout") else "",
                "passed": False  # Will be set during comparison
            }

        return {"status": "Error", "passed": False}

    except Exception as e:
        print(f"Result retrieval error: {e}")
        return {"status": "Error", "passed": False}

def process_test_case(testcase, source_code, language_id):
    """Execute a single test case."""
    token = submit_code(source_code, testcase['input'], language_id)

    if token:
        result = get_submission_result(token)

        if result['status'] == 'Success':
            expected = testcase['expected_output'].strip()
            actual = result['output'].strip()
            result['passed'] = (expected == actual)

        return {
            'input': testcase['input'],
            'expected_output': testcase['expected_output'],
            'actual_output': result.get('output', ''),
            'status': result['status'],
            'passed': result.get('passed', False),
            'stdout': result.get('output', ''),
            'stderr': result.get('output', '') if result['status'] == 'Error' else ''
        }
    else:
        return {
            'input': testcase['input'],
            'expected_output': testcase['expected_output'],
            'actual_output': '',
            'status': 'Submission Failed',
            'passed': False,
            'stdout': '',
            'stderr': 'Failed to submit code'
        }

@app.errorhandler(Exception)
def handle_error(e):
    """Global error handler."""
    traceback.print_exc()  # Log full error traceback
    return make_response(jsonify({
        "error": "An unexpected error occurred",
        "message": str(e)
    }), 500)

@app.route("/api/submissions/submit", methods=["POST"])
def submit_code_api():
    """API to handle code submissions."""
    try:
        # Debugging: print all form data
        print("Received form data:", request.form)
        print("Received files:", request.files)

        problem_id = request.form.get("problemId")
        language_id = request.form.get("languageId")
        
        # Check if code is from file or text input
        if 'codeFile' in request.files:
            file = request.files['codeFile']
            source_code = file.read().decode('utf-8')
        else:
            source_code = request.form.get("code", "")

        if not problem_id:
            return jsonify({"error": "Missing problem ID"}), 400

        if not language_id:
            return jsonify({"error": "Missing language ID"}), 400

        testcases = extract_testcases(problem_id)
        if not testcases:
            return jsonify({"error": "No valid test cases found"}), 400

        # Store received code
        code_path = os.path.join(UPLOAD_FOLDER, f"solution_{problem_id}.{get_file_extension(language_id)}")
        with open(code_path, "w") as f:
            f.write(source_code)

        # Process test cases in parallel
        results = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {
                executor.submit(process_test_case, testcase, source_code, language_id): testcase 
                for testcase in testcases
            }
            for future in as_completed(futures):
                results.append(future.result())

        # Prepare response
        passed_count = sum(1 for r in results if r['passed'])
        total_tests = len(results)
        stdout = results[0]['stdout'] if results else ""
        stderr = results[0]['stderr'] if results and not results[0]['passed'] else ""

        response = {
            "summary": f"{passed_count}/{total_tests} test cases passed",
            "details": results,
            "stdout": stdout,
            "stderr": stderr,
            "status": "Success" if passed_count == total_tests else "Error"
        }
        
        print(f"Response data: {response}")
        return jsonify(response)

    except Exception as e:
        print(f"Submission API error: {e}")
        return jsonify({
            "error": "Submission processing failed",
            "details": str(e),
            "status": "Error"
        }), 500

def get_file_extension(language_id):
    """Get file extension based on language ID."""
    language_extensions = {
        '54': 'cpp',   # C++
        '71': 'py'     # Python
    }
    return language_extensions.get(str(language_id), 'txt')

if __name__ == "__main__":
    app.run(debug=True, port=5000)