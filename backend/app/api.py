import shutil
import uuid
import json
from pathlib import Path
from fastapi import (
    APIRouter, BackgroundTasks, File, UploadFile, HTTPException
)
from fastapi.responses import FileResponse, JSONResponse
from typing import List
import aiofiles

from app.logic.clean_dataset import clean_dataset
from app.logic.augment_dataset import main as augment_dataset_main
from app.logic.utils import validate_dataset_structure, create_zip_from_directory
from app.schemas import AugmentationParams, JobStatusResponse, UploadResponse, CleaningParams

router = APIRouter()
JOBS = {}
BASE_DIR = Path("data")
BASE_DIR.mkdir(exist_ok=True)

# --- Upload endpoint is unchanged ---
@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(files: List[UploadFile] = File(...)):
    job_id = str(uuid.uuid4())
    job_dir = BASE_DIR / job_id
    raw_path = job_dir / "raw"
    raw_path.mkdir(parents=True, exist_ok=True)
    filenames = [f.filename for f in files if f.filename]
    is_valid, message = validate_dataset_structure(filenames)
    if not is_valid: raise HTTPException(status_code=400, detail=message)
    for file in files:
        if not file.filename: continue
        save_path = raw_path / Path(file.filename)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(save_path, "wb") as buffer:
            content = await file.read()
            await buffer.write(content)
    JOBS[job_id] = {"status": "uploaded", "path": str(job_dir)}
    return UploadResponse(job_id=job_id, status="uploaded", message="Dataset uploaded successfully.", filenames=filenames)

# --- Cleaning task is unchanged ---
def _run_cleaning_task(job_id: str, params: CleaningParams):
    job_dir = BASE_DIR / job_id
    try:
        with open(job_dir / "raw" / "classes.txt", "r") as f:
            classes = [line.strip() for line in f if line.strip()]
        stats = clean_dataset(
            base_path=job_dir / "raw", output_path=job_dir / "cleaned",
            classes=classes, remove_unlabeled_images=params.remove_unlabeled_images
        )
        JOBS[job_id].update({"status": "cleaned", "clean_stats": stats})
        create_zip_from_directory(job_dir / "cleaned", job_dir / "cleaned_dataset")
    except Exception as e:
        JOBS[job_id].update({"status": "error", "details": {"error": f"Cleaning failed: {str(e)}", "stage": "cleaning"}})

# --- THIS IS THE NEW, MORE ROBUST AUGMENTATION TASK ---
def _run_augmentation_task(job_id: str, params: AugmentationParams):
    job_dir = BASE_DIR / job_id
    cleaned_dir = job_dir / "cleaned"
    augmented_dir = job_dir / "augmented"
    
    try:
        # Step 1: Robocopy the entire cleaned dataset to the augmented directory first.
        # This guarantees all original files (images, labels, no_label) are present.
        if augmented_dir.exists():
            shutil.rmtree(augmented_dir)
        shutil.copytree(cleaned_dir, augmented_dir)

        # Step 2: Call the simplified augmentation script to work IN-PLACE.
        # It will now add its new files to the already-copied dataset.
        report = augment_dataset_main(
            data_dir=augmented_dir, # Only one directory parameter now
            seed=params.random_seed, 
            enabled_augmentations=params.enabled_augmentations,
            augmentation_cap=params.augmentation_cap
        )
        
        # Step 3: Save the report and zip the final, complete directory.
        with open(augmented_dir / "report.json", 'w') as f:
            json.dump(report, f, indent=4)
        
        JOBS[job_id].update({"status": "augmented", "augment_report": report})
        create_zip_from_directory(augmented_dir, job_dir / "augmented_dataset")

    except Exception as e:
        JOBS[job_id].update({"status": "error", "details": {"error": f"Augmentation failed: {str(e)}", "stage": "augmentation"}})

# --- Endpoints below are unchanged ---
@router.post("/clean/{job_id}", response_model=JobStatusResponse)
async def start_cleaning(job_id: str, params: CleaningParams, background_tasks: BackgroundTasks):
    if job_id not in JOBS: raise HTTPException(status_code=404, detail="Job not found")
    JOBS[job_id]["status"] = "cleaning"
    background_tasks.add_task(_run_cleaning_task, job_id, params)
    return JobStatusResponse(job_id=job_id, status="cleaning")

@router.post("/augment/{job_id}", response_model=JobStatusResponse)
async def start_augmentation(job_id: str, params: AugmentationParams, background_tasks: BackgroundTasks):
    if job_id not in JOBS or JOBS[job_id].get("status") != "cleaned":
        raise HTTPException(status_code=400, detail="Dataset not found or not cleaned yet.")
    JOBS[job_id]["status"] = "augmenting"
    background_tasks.add_task(_run_augmentation_task, job_id, params)
    return JobStatusResponse(job_id=job_id, status="augmenting")

@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    if job_id not in JOBS: raise HTTPException(status_code=404, detail="Job not found")
    return JSONResponse(content=JOBS[job_id])

@router.get("/download/{job_id}/{result_type}")
async def download_results(job_id: str, result_type: str):
    if job_id not in JOBS: raise HTTPException(status_code=404, detail="Job not found")
    if result_type not in ["cleaned", "augmented"]: raise HTTPException(status_code=400, detail="Invalid result type.")
    zip_path = BASE_DIR / job_id / f"{result_type}_dataset.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Result archive not found. The job may still be running or has failed.")
    return FileResponse(path=zip_path, media_type='application/zip', filename=f"{result_type}_dataset_{job_id[:8]}.zip")