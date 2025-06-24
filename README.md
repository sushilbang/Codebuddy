# CodeBuddy

CodeBuddy is a platform designed to help users write efficient code. It integrates Judge0 for code execution and analysis, allowing users to solve programming problems, submit solutions, and receive feedback on efficiency and correctness.

## Features
- **Problem Listing**: Browse a collection of programming challenges.
- **Code Execution**: Run code in multiple languages using Judge0.
- **Result Analysis**: Get feedback on correctness, efficiency, and execution time.
- **User Authentication**: Sign up and log in to track progress.
- **MongoDB Integration**: Store user submissions and problem data.
- **Frontend and Backend**: Built using React (Tailwind CSS) and Node.js.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Code Execution**: Judge0 (self hosted)

## Installation

### Prerequisites
- Node.js (>= 16.x)
- MongoDB (local or Atlas)
- Judge0 self hosting setup: use this [link](https://denishoti.medium.com/how-to-self-host-judge0-api-on-your-pc-locally-all-you-need-to-know-ad8a2b64fd1) for reference.

### Clone the repo
```bash
git clone https://github.com/yourusername/codebuddy.git
cd codebuddy
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

### .env example
```bash
PORT=5000
MONGO_URI=your_mongo_connection_string
JUDGE0_URL=http://localhost:2358
JWT_SECRET=your_jwt_secret
```

### Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

## Folder Structure
```
/codebuddy/
  ├── backend/
  │   ├── controllers/
  │   ├── models/
  │   ├── routes/
  │   ├── services/
  │   ├── .env
  │   ├── server.js
  │
  ├── frontend/
  │   ├── src/
  │   ├── components/
  │   ├── pages/
  │   ├── App.js
```

## Contributing
1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit changes
4. Push to the branch and open a pull request

