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
    Cleans a YOLO dataset by validating images and labels, and standardizing image formats.
    """
    images_in_path = base_path / "images"
    labels_in_path = base_path / "labels"
    images_out_path = output_path / "images"
    labels_out_path = output_path / "labels"
    unlabeled_out_path = output_path / "unlabeled_images"

    # Ensure output directories are clean and exist
    if output_path.exists():
        shutil.rmtree(output_path)
    images_out_path.mkdir(parents=True, exist_ok=True)
    labels_out_path.mkdir(exist_ok=True)
    unlabeled_out_path.mkdir(exist_ok=True)

    stats = {
        "images_processed": 0,
        "corrupted_removed": 0,
        "mismatched_labels": 0,
        "unlabeled_images_found": 0,
        "valid_images_saved": 0,
        "class_count": len(classes)
    }

    image_paths = list(images_in_path.iterdir())
    label_stems = {p.stem for p in labels_in_path.glob("*.txt")} if labels_in_path.exists() else set()

    for img_path in image_paths:
        stats["images_processed"] += 1
        
        # 1. Test image openability
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

        # 2. Check for corresponding label file
        if file_stem not in label_stems:
            stats["unlabeled_images_found"] += 1
            if not remove_unlabeled_images:
                new_img_path = unlabeled_out_path / f"{clean_name}.jpg"
                cv2.imwrite(str(new_img_path), img)
            continue

        label_path = labels_in_path / f"{file_stem}.txt"
        valid_lines = []
        has_valid_labels_in_file = False

        with open(label_path, 'r') as f:
            lines = f.readlines()
        
        if not lines:
            stats["unlabeled_images_found"] += 1
            if not remove_unlabeled_images:
                new_img_path = unlabeled_out_path / f"{clean_name}.jpg"
                cv2.imwrite(str(new_img_path), img)
            continue
        
        for line in lines:
            parts = line.strip().split()
            if not parts:
                continue
            
            # 3. Validate class index
            try:
                class_idx = int(parts[0])
                if class_idx >= len(classes) or class_idx < 0:
                    stats["mismatched_labels"] += 1
                    continue
                valid_lines.append(line)
                has_valid_labels_in_file = True
            except (ValueError, IndexError):
                stats["mismatched_labels"] += 1
                continue

        # 4. Save cleaned outputs if any valid labels were found
        if has_valid_labels_in_file:
            stats["valid_images_saved"] += 1
            new_img_path = images_out_path / f"{clean_name}.jpg"
            cv2.imwrite(str(new_img_path), img)

            new_label_path = labels_out_path / f"{clean_name}.txt"
            with open(new_label_path, 'w') as f_out:
                f_out.writelines(valid_lines)
        else: # If all labels in the file were invalid
            stats["unlabeled_images_found"] += 1
            if not remove_unlabeled_images:
                new_img_path = unlabeled_out_path / f"{clean_name}.jpg"
                cv2.imwrite(str(new_img_path), img)
    
    # Remove empty directories
    if not os.listdir(unlabeled_out_path):
        os.rmdir(unlabeled_out_path)
    if not os.listdir(labels_out_path):
        os.rmdir(labels_out_path)

    return stats