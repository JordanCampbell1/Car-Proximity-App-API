# Installation Instructions for the Car Proximity App API

Follow the steps below to set up and run the Car Proximity App API on your local machine.

## Prerequisites

Ensure you have the following installed on your computer:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (installed and running)

## Step-by-Step Installation

1. **Clone the Repository**

   Clone the repository to your local machine using the following command:

   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the Project Directory**

   Change your directory to the project folder:

   ```bash
   cd Car-Proximity-App-API
   ```

3. **Install Dependencies**

   Install the required dependencies by running:

   ```bash
   npm install
   ```

4. **Create a `.env` File**

   Create a `.env` file in the root directory of the project and add the following configuration:

   ```plaintext
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/proximityCarDB
   JWT_SECRET=jwt_secret_key
   ```

5. **Set Up the Database**

   To set up the database and seed it with test data, run the following command:

   ```bash
   npm run setup
   ```

   This command will execute the `setup.ts` script, which connects to the database and runs the `seed.ts` file to populate it with initial data.

6. **Run the Server**

   After the setup is complete, you can run the server using:

   ```bash
   npm run dev
   ```

   Your server should now be running on [http://localhost:3000](http://localhost:3000).

## Accessing the API

You can access the API and verify that the server is running by navigating to the following URL in your web browser:

[http://localhost:3000/health](http://localhost:3000/health)

## Additional Notes

- If you encounter any issues during the setup, ensure that MongoDB is running and accessible at the specified URI.
- Make sure to check your console for any error messages, which can provide guidance for troubleshooting.

