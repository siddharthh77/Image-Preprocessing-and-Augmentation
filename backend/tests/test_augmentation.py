import pytest
import numpy as np
from backend.app.logic.augment_dataset import flip

def test_flip_augmentation():
    # Mock image (not actually used in bbox calculation, but good practice)
    mock_img = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Bounding box: class 0, center at (0.2, 0.3), width 0.1, height 0.15
    bboxes = [[0, 0.2, 0.3, 0.1, 0.15]]
    
    _, new_bboxes = flip(mock_img, bboxes)
    
    flipped_box = new_bboxes[0]
    
    # Original x_center was 0.2. Flipped should be 1.0 - 0.2 = 0.8
    assert flipped_box[0] == 0  # class_id should not change
    assert pytest.approx(flipped_box[1]) == 0.8 # x_center
    assert flipped_box[2] == 0.3 # y_center should not change
    assert flipped_box[3] == 0.1 # width should not change
    assert flipped_box[4] == 0.15 # height should not change