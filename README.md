# Student Login Web Application

This is a simple web application for student login functionality, hosted at [student-login.onrender.com](https://student-login.onrender.com/login).

## Features

- **User Authentication**: Secure student login functionality with encrypted passwords.
- **Responsive Design**: A user-friendly interface that works well on different devices.
- **Error Handling**: Clear and concise error messages for invalid inputs.
- **Server-side Rendering**: Dynamic HTML content generation using templating engines like EJS.

## Tech Stack

- **Node.js**: Backend runtime environment.
- **Express.js**: Fast and minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data.
- **EJS**: Templating engine for rendering dynamic web pages.

## Getting Started

Follow these instructions to get a copy of the project running on your local machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: [Download and install](https://nodejs.org/)
- **MongoDB**: [Download and install](https://www.mongodb.com/try/download/community)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sumit-s-nair/Student-Login.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Student-Login
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/student-login
   SESSION_SECRET=yourSecretKey
   ```

5. Start the application:
   ```bash
   nodemon server.js
   ```

6. Visit `http://localhost:3000/login` to access the application.

## Project Structure

```bash
Student-Login/
│
├── models/              # MongoDB schema definitions
├── public/              # Static assets (CSS, JS, images)
├── views/               # EJS templates for server-side rendering
├── process.env          # Environment variables
├── server.js            # Main application file
└── package.json         # Project metadata and dependencies
```

## Deployment

The application is hosted on Render. Follow the steps below to deploy:

1. Set up a free account on [Render](https://render.com/).
2. Link your GitHub repository and choose your project.
3. Configure your environment variables in Render's dashboard.
4. Deploy the app directly from your repository.

## License

This project is licensed under the MIT License.

## Contact

For any issues or suggestions, feel free to open an issue.

[GitHub Repo](https://github.com/sumit-s-nair/Student-Login)
