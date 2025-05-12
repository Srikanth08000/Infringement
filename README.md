

# Submitted by: Srikanth Siddamsetty
# Email: srikanthsiddamsetty20@gmail.com



# Patent Infringement Check App

## Overview
This is a full-stack application that allows users to **dynamically check patent infringement** by entering a **Patent ID** and **Company Name** through a form interface. The app uses OpenAI's API to analyze potential infringement and returns the **top two infringing products** along with detailed explanations based on relevant patent claims.

The application includes:

- A **Python Flask backend** for handling requests and performing analysis.
- A **React frontend** (built with TypeScript and Material-UI) for user interaction.
- A **Dockerized environment** for seamless setup and deployment.


##  What’s New in the Enhanced Version

-  **Dynamic Input via UI Form**: Users can input patent IDs and company names directly through the frontend without editing any JSON files.
-  **Real-Time Analysis**: Results are generated and displayed immediately based on user input.
-  **Clear and Structured UI**: Analysis includes infringement likelihood, relevant claims, explanations, and features for each product.
-  **Both Versions Included**: The original (static JSON analysis) and the enhanced (dynamic input) versions are included.


## Prerequisites
- **Docker**: Ensure Docker is installed and running on your MacBook.
- **Docker Compose**: Ensure Docker Compose is installed (included with Docker Desktop for Mac).

## Setup
1. **OpenAI API Key**:
   - An OpenAI API key is already hardcoded in backend/app.py for convenience, so you don’t need to provide your own key. However, if you prefer to use your own key, you can replace the hardcoded key in app.py (search for client = OpenAI(api_key="sk-...")) with your own API key.

2. **Ensure JSON Files Are Present**:
   - The backend/data/ directory should contain patents.json and company_products.json. These files are already included with sample data:
     - patents.json: Contains patent IDs and their claims.
     - company_products.json: Contains companies and their products with summaries.

## How to Run
1. **Build and Start the App**:
   - Make Sure Docker Desktop is installed and running in the background
   - From the project root, run:
     
bash
     docker-compose up --build

     

2. **Accessing the App**:
   - This command builds and starts both the backend (Flask on port 8000) and frontend (React on port 3000) services. All dependencies (React, Material-UI, TypeScript, etc.) are installed automatically within the Docker containers.
   - Open your browser and navigate to http://localhost:3000.
   - Enter a Patent ID and Company Name in the form and click Submit.
   - The app will return the top two potentially infringing products along with their infringement likelihood, relevant patent claims, detailed explanations, and specific matched features.

3. **Turning Off the App**:
   - To stop the app and free up port 8000, navigate to the project root and run: 
     ```bash
     docker-compose down```









