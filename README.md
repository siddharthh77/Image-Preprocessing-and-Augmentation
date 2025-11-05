# Dataset Cleaner & Augmentor

A full-stack web application to clean, standardize, and augment object detection datasets in YOLO format. Built with React, TypeScript, and FastAPI.

## Features

*   **Upload Dataset**: Upload your dataset as a folder or ZIP file containing `images/`, `labels/`, and `classes.txt`.
*   **Cleaning Pipeline**:
    *   Removes corrupted/unopenable images.
    *   Validates label files and removes annotations for invalid class IDs.
    *   Handles images with missing labels by moving them to a `no_label/` folder.
    *   Standardizes all images to `.jpg` format with clean, lowercase filenames.
*   **Augmentation Pipeline**:
    *   Performs class balancing by augmenting minority classes.
    *   Supports a variety of augmentations: flip, color jitter, rotation, scale, translate, blur, and cutout.
    *   Provides control over augmentation parameters like the random seed.
*   **Statistics & Visualization**: Displays pre- and post-processing statistics, including class distribution charts.
*   **Download Results**: Download the cleaned or augmented dataset as a ZIP archive.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite, TailwindCSS, D3.js
*   **Backend**: FastAPI (Python), OpenCV, NumPy

---

## Local Development Setup 

Follow these steps to run the application on your local machine.

### Prerequisites

*   **Python** (3.10 or newer) and `pip`.
*   **Node.js** (v18 or newer) and `npm` (or `yarn`).

### 1. Backend Setup

First, set up and run the FastAPI server.

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
.\venv\Scripts\activate

# 3. Install the required Python packages
pip install -r requirements.txt

# 4. Run the FastAPI server
# The --reload flag automatically restarts the server when you change code.
uvicorn app.main:app --reload
```
### 1. Frontend Setup

In a new terminal window, set up and run the React development server.

```bash

# 1. Navigate to the frontend directory
cd frontend

# 2. Install the required Node.js packages
npm install

# 3. Set up the environment file
# This tells the frontend where to find the backend.
# The project already includes a .env.local file for this.
# Ensure it contains the following line:
# VITE_API_URL=http://localhost:8000/api

# 4. Run the React development server
npm run dev
```

The frontend application will now be running at http://localhost:5173. Leave this terminal running as well.

### 3. Usage

With both servers running, open your web browser and navigate to http://localhost:5173 to use the application.

### Project Structure

A high-level overview of the project's folder structure.

.
├── backend/
│   ├── app/
│   │   ├── api.py           # FastAPI endpoints
│   │   ├── main.py          # FastAPI app initialization
│   │   └── logic/           # Core processing scripts
│   │       ├── clean_dataset.py
│   │       └── augment_dataset.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/      # Reusable React components
    │   ├── pages/           # Main page component (HomePage.tsx)
    │   ├── App.tsx          # Main application layout
    │   └── context/         # React context for state management
    └── package.json
