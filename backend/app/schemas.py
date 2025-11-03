from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class CleaningParams(BaseModel): # <-- ADD THIS NEW CLASS
    remove_unlabeled_images: bool = Field(default=False, description="If true, permanently deletes images that have no valid labels after cleaning.")

class AugmentationParams(BaseModel):
    random_seed: int = Field(default=42, description="Seed for reproducibility.")
    enabled_augmentations: List[str] = Field(
        default=['flip', 'color', 'rotate', 'scale', 'translate', 'blur', 'cutout'],
        description="List of augmentations to apply."
    )
    augmentation_cap: Optional[int] = Field(
        default=None,
        description="Optional maximum number of images per class. If null, balances to the majority class."
    )

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    details: Optional[Dict] = None

class UploadResponse(BaseModel):
    job_id: str
    status: str
    message: str
    filenames: List[str]