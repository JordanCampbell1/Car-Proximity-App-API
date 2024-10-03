# Installation Guide for Proximity-Based Car Assistant API

This document provides step-by-step instructions for setting up and running the Proximity-Based Car Assistant API on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (make sure it's running on your local machine)

## Step 1: Clone the Repository

1. Open your terminal (Command Prompt, PowerShell, or Terminal).
2. Clone the repository using the following command:

   ```bash
   git clone https://github.com/yourusername/Car-Proximity-App-API.git
   ```

   Replace `yourusername` with your GitHub username.

3. Change to the project directory:

   ```bash
   cd Car-Proximity-App-API
   ```

## Step 2: Install Dependencies

1. Make sure you are in the project directory (where `package.json` is located).
2. Run the following command to install the required packages:

   ```bash
   npm install
   ```

   This will install the dependencies listed in `package.json`.

## Step 3: Set Up Environment Variables

1. Create a new file in the root of the project named `.env`.
2. Add the following lines to the `.env` file:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/proximityCarDB
   JWT_SECRET=jwt_secret_key
   ```

   These environment variables configure the server port, MongoDB connection string, and JWT secret key.

## Step 4: Start the MongoDB Server

Make sure your MongoDB server is running. You can do this by starting it from the command line:

```bash
mongod
```

## Step 5: Run the Application

1. In your terminal, make sure you are still in the project directory.
2. Use the following command to start the server with nodemon:

   ```bash
   npm run dev
   ```

   This command will start the server in development mode, and it will automatically restart when you make changes to the code.

## Step 6: Access the API

Once the server is running, you can access the API in your browser or via an API client like Postman:

- Open your browser and go to: [http://localhost:3000/health](http://localhost:3000/health)

You should see a message indicating that the server is running.

## Additional Notes

- If you encounter any issues, ensure that all dependencies are installed correctly and that MongoDB is running.
- You can modify the `.env` file as needed for different configurations (e.g., different MongoDB URIs).

---

That's it! You have successfully installed and set up the Proximity-Based Car Assistant API.
```
