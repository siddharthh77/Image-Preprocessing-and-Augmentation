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

## Local Development Setup (Without Docker)

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