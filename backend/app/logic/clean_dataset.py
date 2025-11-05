import os
import cv2
import shutil
from pathlib import Path
from typing import List, Dict

def clean_dataset(
    base_path: Path,
    output_path: Path,
    classes: List[str],
    remove_unlabeled_images: bool = False
) -> Dict:
    """
    Cleans a YOLO dataset by validating images and labels.
    This is the final, correct version that robustly handles unlabeled images.
    """
    images_in_path = base_path / "images"
    labels_in_path = base_path / "labels"
    
    # Define all possible output paths
    images_out_path = output_path / "images"
    labels_out_path = output_path / "labels"
    unlabeled_out_path = output_path / "no_label"

    # Start with a completely clean slate for the output
    if output_path.exists():
        shutil.rmtree(output_path)
    
    # ALWAYS create the primary output directories
    images_out_path.mkdir(parents=True, exist_ok=True)
    labels_out_path.mkdir(exist_ok=True)
    
    stats = {
        "images_processed": 0, "corrupted_removed": 0, "invalid_labels_removed": 0,
        "unlabeled_images_found": 0, "valid_images_saved": 0, "class_count": len(classes)
    }

    image_paths = list(images_in_path.iterdir()) if images_in_path.exists() else []
    label_stems = {p.stem for p in labels_in_path.glob("*.txt")} if labels_in_path.exists() else set()

    for img_path in image_paths:
        stats["images_processed"] += 1
        
        try:
            img = cv2.imread(str(img_path))
            if img is None:
                stats["corrupted_removed"] += 1
                continue
        except Exception:
            stats["corrupted_removed"] += 1
            continue

        file_stem = img_path.stem
        clean_name = file_stem.lower().replace(" ", "_")
        
        # --- Start of Corrected Logic ---
        has_label_file = file_stem in label_stems
        is_labeled_and_valid = False
        
        if has_label_file:
            label_path = labels_in_path / f"{file_stem}.txt"
            valid_lines = []
            with open(label_path, 'r') as f:
                lines = f.readlines()
            
            for line in lines:
                parts = line.strip().split()
                if not parts: continue
                try:
                    class_idx = int(parts[0])
                    if 0 <= class_idx < len(classes):
                        valid_lines.append(line)
                    else:
                        stats["invalid_labels_removed"] += 1
                except (ValueError, IndexError):
                    stats["invalid_labels_removed"] += 1
            
            if valid_lines:
                # If we found at least one valid line, the image is good.
                is_labeled_and_valid = True
                stats["valid_images_saved"] += 1
                cv2.imwrite(str(images_out_path / f"{clean_name}.jpg"), img)
                with open(labels_out_path / f"{clean_name}.txt", 'w') as f_out:
                    f_out.writelines(valid_lines)
        
        if not is_labeled_and_valid:
            # This case is hit if:
            # 1. There was no label file.
            # 2. The label file was empty.
            # 3. The label file only contained invalid labels.
            stats["unlabeled_images_found"] += 1
            if not remove_unlabeled_images:
                # If we need to save it, ensure the directory exists first.
                if not unlabeled_out_path.exists():
                    unlabeled_out_path.mkdir(exist_ok=True)
                cv2.imwrite(str(unlabeled_out_path / f"{clean_name}.jpg"), img)
        # --- End of Corrected Logic ---

    # Finally, remove any output directories that ended up being empty
    for path in [unlabeled_out_path, labels_out_path, images_out_path]:
        if path.exists() and not os.listdir(path):
            os.rmdir(path)

    return stats