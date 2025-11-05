import shutil
from pathlib import Path

def create_zip_from_directory(dir_path: Path, zip_path: Path):
    """
    Creates a zip archive from a directory.
    """
    shutil.make_archive(str(zip_path), 'zip', str(dir_path))

def validate_dataset_structure(filenames: list[str]) -> tuple[bool, str]:
    """
    Validates that the uploaded files contain the required 'classes.txt' and a non-empty 'images/' folder.
    """
    if "classes.txt" not in filenames:
        return False, "Error: `classes.txt` file is missing."

    # Check if any file path starts with "images/" and is not just the folder itself.
    has_images = any(f.startswith("images/") and f != "images/" for f in filenames)
    if not has_images:
        return False, "Error: The 'images' folder is missing or is empty."

    return True, "Validation successful."