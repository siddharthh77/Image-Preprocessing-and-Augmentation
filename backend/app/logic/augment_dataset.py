import os
import cv2
import random
import json
import shutil
from pathlib import Path
import numpy as np
from typing import List, Dict, Optional, Tuple, Callable

# --- Augmentation Functions (No changes here) ---
def flip(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    img_flipped = cv2.flip(img, 1)
    new_bboxes = []
    for box in bboxes:
        class_id, x_center, y_center, width, height = box
        new_x_center = 1.0 - x_center
        new_bboxes.append([class_id, new_x_center, y_center, width, height])
    return img_flipped, new_bboxes

def adjust_color(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    beta = random.randint(-40, 40)
    alpha = random.uniform(0.7, 1.3)
    img_adjusted = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
    return img_adjusted, bboxes

def rotate(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    h, w = img.shape[:2]
    angle = random.uniform(-10, 10)
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1)
    img_rotated = cv2.warpAffine(img, M, (w, h))
    rad_angle = -np.deg2rad(angle)
    cos_a, sin_a = np.cos(rad_angle), np.sin(rad_angle)
    new_bboxes = []
    for box in bboxes:
        class_id, x_c, y_c, width, height = box
        px_c, py_c = x_c * w, y_c * h
        px_c_centered, py_c_centered = px_c - w / 2, py_c - h / 2
        new_px_c = (px_c_centered * cos_a - py_c_centered * sin_a) + w / 2
        new_py_c = (px_c_centered * sin_a + py_c_centered * cos_a) + h / 2
        new_bboxes.append([class_id, new_px_c / w, new_py_c / h, width, height])
    return img_rotated, new_bboxes

def scale(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    h, w = img.shape[:2]
    scale_factor = random.uniform(0.9, 1.1)
    nh, nw = int(h * scale_factor), int(w * scale_factor)
    img_resized = cv2.resize(img, (nw, nh))
    canvas = np.full((h, w, 3), 128, dtype=np.uint8)
    x_off = (w - nw) // 2
    y_off = (h - nh) // 2
    start_row, start_col = max(0, -y_off), max(0, -x_off)
    end_row, end_col = min(nh, h - y_off), min(nw, w - x_off)
    paste_start_row, paste_start_col = max(0, y_off), max(0, x_off)
    canvas[paste_start_row:paste_start_row + (end_row - start_row), paste_start_col:paste_start_col + (end_col - start_col)] = img_resized[start_row:end_row, start_col:end_col]
    new_bboxes = []
    for box in bboxes:
        class_id, x_c, y_c, width, height = box
        new_bboxes.append([class_id, (x_c * nw + x_off) / w, (y_c * nh + y_off) / h, width * scale_factor, height * scale_factor])
    return canvas, new_bboxes

def translate(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    h, w = img.shape[:2]
    tx = random.uniform(-0.1, 0.1) * w
    ty = random.uniform(-0.1, 0.1) * h
    M = np.float32([[1, 0, tx], [0, 1, ty]])
    img_translated = cv2.warpAffine(img, M, (w, h))
    new_bboxes = []
    for box in bboxes:
        class_id, x_c, y_c, width, height = box
        new_bboxes.append([class_id, x_c + tx / w, y_c + ty / h, width, height])
    return img_translated, new_bboxes

def add_gaussian_blur(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    blur_level = random.choice([3, 5, 7])
    return cv2.GaussianBlur(img, (blur_level, blur_level), 0), bboxes

def cutout(img: np.ndarray, bboxes: list) -> Tuple[np.ndarray, list]:
    h, w = img.shape[:2]
    for _ in range(random.randint(1, 3)):
        size_h, size_w = int(h * random.uniform(0.05, 0.15)), int(w * random.uniform(0.05, 0.15))
        x, y = random.randint(0, w - size_w), random.randint(0, h - size_h)
        img[y:y+size_h, x:x+size_w] = (128, 128, 128)
    return img, bboxes

AUGMENTATION_MAP: Dict[str, Callable] = {
    'flip': flip, 'color': adjust_color, 'rotate': rotate, 'scale': scale,
    'translate': translate, 'blur': add_gaussian_blur, 'cutout': cutout,
}

# --- THIS IS THE CORRECTED, ROBUST MAIN FUNCTION ---
def main(input_dir: Path, output_dir: Path, seed: int, enabled_augmentations: List[str], augmentation_cap: Optional[int]) -> Dict:
    random.seed(seed)
    np.random.seed(seed)

    image_path, label_path = input_dir / 'images', input_dir / 'labels'
    output_img, output_lbl = output_dir / 'images', output_dir / 'labels'

    if output_dir.exists(): shutil.rmtree(output_dir)
    output_img.mkdir(parents=True, exist_ok=True)
    output_lbl.mkdir(exist_ok=True)

    # --- Step 1: Correctly count every INSTANCE of each class ---
    instance_counts: Dict[str, int] = {}
    # Also keep track of which files contain which classes for later
    class_to_files: Dict[str, List[Path]] = {}
    all_label_files = list(sorted(label_path.glob('*.txt')))

    for label_file in all_label_files:
        img_file = image_path / (label_file.stem + '.jpg')
        if not img_file.exists():
            continue

        # Copy original files to the output directory
        shutil.copy(img_file, output_img)
        shutil.copy(label_file, output_lbl)

        classes_in_this_file = set()
        with open(label_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if not parts: continue
                class_id = parts[0]
                # Increment the instance count for this class
                instance_counts[class_id] = instance_counts.get(class_id, 0) + 1
                classes_in_this_file.add(class_id)
        
        # Associate this file with every class it contains
        for class_id in classes_in_this_file:
            if class_id not in class_to_files:
                class_to_files[class_id] = []
            class_to_files[class_id].append(label_file)

    if not instance_counts:
        return {"error": "Cleaned dataset has no labels or is empty."}

    initial_counts = instance_counts.copy()
    max_count = max(instance_counts.values())
    target_count = min(max_count, augmentation_cap) if augmentation_cap is not None else max_count
    total_augmentations_applied = 0

    available_augs = [aug for aug in enabled_augmentations if aug in AUGMENTATION_MAP]
    if not available_augs:
        return {"error": "No valid augmentations were selected or available."}

    # --- Step 2: Augment minority classes based on the correct instance count ---
    for class_id, count in instance_counts.items():
        needed = target_count - count
        if needed <= 0:
            continue

        # Get the list of files that contain this minority class
        source_files = class_to_files.get(class_id, [])
        if not source_files:
            continue
        
        # Create one new augmented image for each missing instance
        for i in range(needed):
            source_label_file = random.choice(source_files)
            source_img_file = image_path / (source_label_file.stem + '.jpg')
            
            img = cv2.imread(str(source_img_file))
            if img is None: continue

            with open(source_label_file, 'r') as f:
                bboxes = [[parts[0]] + [float(p) for p in parts[1:]] for line in f if (parts := line.strip().split())]

            aug_func = AUGMENTATION_MAP[random.choice(available_augs)]
            aug_img, aug_bboxes = aug_func(img.copy(), bboxes)

            aug_name_stem = f"{source_label_file.stem}_aug_{class_id}_{i}"
            cv2.imwrite(str(output_img / f"{aug_name_stem}.jpg"), aug_img)
            with open(output_lbl / f"{aug_name_stem}.txt", 'w') as f_out:
                for box in aug_bboxes:
                    box_class, x, y, w, h = box
                    x, y = max(0.0, min(1.0, x)), max(0.0, min(1.0, y))
                    if w > 0.01 and h > 0.01:
                        f_out.write(f"{box_class} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")
            
            total_augmentations_applied += 1

    # --- Step 3: Recalculate final INSTANCE counts by re-scanning the output directory ---
    final_counts: Dict[str, int] = {}
    for label_file in sorted(output_lbl.glob('*.txt')):
        with open(label_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if not parts: continue
                class_id = parts[0]
                final_counts[class_id] = final_counts.get(class_id, 0) + 1

    report = {
        "initial_class_counts": initial_counts,
        "final_class_counts": final_counts,
        "total_augmentations_applied": total_augmentations_applied
    }
    with open(output_dir / "report.json", 'w') as f:
        json.dump(report, f, indent=4)
        
    return report