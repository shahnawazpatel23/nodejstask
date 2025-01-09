# React Authentication App

This project is a basic React application for user authentication. It includes features like user registration, login, password reset, and a dashboard for authenticated users.

## Features

- User Registration
- User Login
- Forgot Password
- Password Reset
- Protected Dashboard

## Technologies Used

- **front:** React, TailwindCSS, React Router DOM
- **back:** Node.js, Express.js, MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB instance
- Gmail account for sending emails (or any other SMTP email service)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. Install dependencies for both front and back:
   ```bash
   # In the front folder
   cd front
   npm install

   # In the back folder
   cd ../back
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the back folder with the following variables:
     ```env
     MONGO_URI=your_mongo_connection_string
     JWT_SECRET=your_secret_key
     EMAIL_USER=your_email@example.com
     EMAIL_PASSWORD=your_email_password
     ```

### Running the Application

1. Start the back server:
   ```bash
   cd back
   npm start
   ```

2. Start the front development server:
   ```bash
   cd front
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## Folder Structure

```
project-folder/
├── back/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
├── front/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
├── README.md
```

## Key Files and Code Highlights

### back

- **server.js:** Sets up the back server, handles CORS, and defines API endpoints.
- **models/user.js:** Defines the User schema for MongoDB.
- **routes:** Contains API routes for authentication and password reset.

### front

- **App.jsx:** Main React component that handles routing.
- **pages/Login.jsx, Signup.jsx, ForgotPassword.jsx:** UI and logic for authentication features.
- **components/Dashboard.jsx:** Protected page shown after successful login.



