import pytest
import cv2
import numpy as np
import shutil
from pathlib import Path
from backend.app.logic.clean_dataset import clean_dataset

@pytest.fixture
def setup_test_dataset():
    # Create a temporary directory for the test dataset
    test_dir = Path("test_temp_dataset")
    images_dir = test_dir / "raw/images"
    labels_dir = test_dir / "raw/labels"
    images_dir.mkdir(parents=True, exist_ok=True)
    labels_dir.mkdir(parents=True, exist_ok=True)

    # 1. Create a valid image and label
    valid_img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.imwrite(str(images_dir / "valid_img.jpg"), valid_img)
    with open(labels_dir / "valid_img.txt", "w") as f:
        f.write("0 0.5 0.5 0.2 0.2\n") # class 0

    # 2. Create a corrupted (empty) image
    (images_dir / "corrupted_img.jpg").touch()

    # 3. Create an image with an invalid label
    cv2.imwrite(str(images_dir / "invalid_label_img.jpg"), valid_img)
    with open(labels_dir / "invalid_label_img.txt", "w") as f:
        f.write("3 0.5 0.5 0.2 0.2\n") # class 3 (out of bounds)
    
    # 4. Create an image with no label file
    cv2.imwrite(str(images_dir / "unlabeled_img.jpg"), valid_img)
    
    # 5. Create the classes.txt file
    with open(test_dir / "raw/classes.txt", "w") as f:
        f.write("class0\nclass1\n")
    
    yield test_dir
    
    # Teardown: remove the temporary directory
    shutil.rmtree(test_dir)

def test_clean_dataset(setup_test_dataset):
    test_dir = setup_test_dataset
    raw_path = test_dir / "raw"
    output_path = test_dir / "cleaned"
    classes = ["class0", "class1"]

    stats = clean_dataset(raw_path, output_path, classes, remove_unlabeled_images=False)
    
    assert stats["images_processed"] == 4
    assert stats["corrupted_removed"] == 1
    assert stats["unlabeled_images_found"] == 2 # one with no file, one with only invalid labels
    assert stats["invalid_labels_removed"] == 1
    assert stats["valid_images_saved"] == 1
    
    assert (output_path / "images/valid_img.jpg").exists()
    assert not (output_path / "images/corrupted_img.jpg").exists()
    assert (output_path / "no_label/unlabeled_img.jpg").exists()
    assert (output_path / "no_label/invalid_label_img.jpg").exists()