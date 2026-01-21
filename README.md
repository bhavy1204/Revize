# Revize

**Revize** is a web-based task management application designed to leverage the power of **spaced repetition**. It helps users retain information and manage tasks effectively by scheduling revisions at optimal intervals.

## 🚀 Features

- **Smart Scheduling**: Automatically schedules revisions for tasks based on a scientifically proven spaced repetition algorithm (intervals: 1, 3, 7, 14, 30, 60 days).
- **Task Management**: Create tasks with headings, descriptions, and optional external links.
- **File Attachments**: Upload and attach images or PDFs to your tasks for easy reference (powered by Cloudinary).
- **Dashboard Overview**:
  - **Today's Revisions**: Focus on what needs to be reviewed today.
  - **Pending Revisions**: Catch up on missed reviews.
  - **Upcoming Revisions**: Preview future scheduled tasks.
- **Progress Tracking**: Mark revisions as complete and track your consistency.
- **Secure Authentication**: User sign-up and login handled securely via Auth0.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (powered by [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Auth0](https://auth0.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Security**: CORS, Dotenv

## ⚙️ Installation & Setup

Prerequisites: Node.js and npm installed on your machine.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Revize
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (if needed for API URLs, though currently hardcoded or proxy-based):
```env
# Example if environment variables are used for API URL
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

## 📡 API Endpoints

### Tasks
- `POST /api/v1/tasks/create-task` - Create a new task with schedule.
- `GET /api/v1/tasks/today` - Get revisions scheduled for today.
- `GET /api/v1/tasks/pending` - Get all overdue/pending revisions.
- `GET /api/v1/tasks/upcoming` - Get future scheduled revisions.
- `POST /api/v1/tasks/complete` - Mark a specific revision as complete.
- `DELETE /api/v1/tasks/delete` - Delete a task.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
