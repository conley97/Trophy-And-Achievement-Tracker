# Trophy and Achievement Tracker

Welcome to the Trophy and Achievement Tracker project repository.

This project allows users to track their gaming achievements and trophies across multiple platforms, including PlayStation (PSN) and Steam. Below are the instructions to set up and run the project locally.

## 🛠 Project Setup

### 1. Install MongoDB

First, you need to have a local MongoDB server running. Install MongoDB and ensure it is accessible at `mongodb://localhost:27017/`. After installing MongoDB, connect to the server using MongoDB Compass to verify that the connection is successful.

### 2. Backend Installation

Open Visual Studio Code (VS Code). If you haven't installed VS Code, please download and install it first.

In VS Code, open the backend folder from this project.

Open a terminal within VS Code and run the following commands:

- `npm install`
- `npm run build`
- `npm run start`

After running these commands, the server should be connected and running.

### 3. Frontend Installation

Open another instance of Visual Studio Code.

Open the frontend folder in this instance.

In the terminal, run the following commands:

- `npm install`
- `npm run build`
- `npm run start`

This will start the frontend, and a webpage should automatically open displaying the project interface.

## 🚀 Usage

Once the project is running, you can register a new user and enter your platform IDs to track your achievements.

If you don't have platform IDs and want to test the application, use the following test IDs:

- **PlayStation (PSN):** `conley97`
- **Steam:** `76561198363566598`

It may take some time to fetch the data, but once it does, you will be able to view the games and their associated achievements.

You can click on the game titles to get further details.

## 🔧 Dependencies

Make sure all dependencies are installed correctly using the `npm install` command in both the backend and frontend folders. The project uses various npm packages to manage functionalities across both sections.
