# `augment_dataset.py` Documentation

## Overall Purpose

The goal of this script is to perform **class balancing** on a cleaned YOLO dataset. In many real-world datasets, you might have many images of one class (e.g., "car") but very few of another (e.g., "bicycle"). This imbalance can make a machine learning model biased. This script fixes the problem by creating new, slightly modified images of the minority classes until they have as many images as the majority class.

## How It Works (Core Logic)

The script follows a clear, step-by-step process:

1.  **Initial Count:** It first scans the entire dataset and counts how many **images** contain at least one instance of each class. This gives us the "before" distribution (e.g., `{'cars': 50 images, 'bicycles': 10 images}`).
2.  **Determine Target:** It identifies the class with the most images (in our example, "cars" with 50) and sets this as the target number.
3.  **Identify Minorities:** It compares each class count to the target number. Any class with fewer images is identified as a minority class that needs augmentation.
4.  **Augment Minorities:** For each minority class, it calculates how many new images are needed (e.g., `50 - 10 = 40` new "bicycle" images).
    *   It then enters a loop to create that many new images.
    *   In each loop, it randomly picks an existing image that contains a "bicycle".
    *   It applies a random visual transformation (like flipping, rotating, or changing colors) to that image.
    *   Crucially, it also calculates the new coordinates for the bounding boxes on the transformed image.
    *   It saves the new image and its new label file with a unique name (e.g., `bicycle_image_1_aug_0.jpg`).
5.  **Final Count & Report:** After all minority classes have been augmented, it re-scans the entire output folder to get the "after" distribution and returns a final report summarizing the process.

---

## Functions Breakdown

This script is divided into a `main()` function that orchestrates the process and several smaller helper functions that perform the actual image transformations.

### `main()`

This is the main function that drives the entire augmentation workflow.

*   **Parameters (Inputs):**

    *   `data_dir` (`Path`): The path to the directory containing the cleaned dataset (`images/` and `labels/`). The script will **add new files directly into this directory**.
    *   `seed` (`int`): A number used to initialize the random number generator. Using the same seed ensures that the "random" augmentations are identical every time, which is important for reproducible experiments.
    *   `enabled_augmentations` (`List[str]`): A list of strings specifying which transformations are allowed to be used (e.g., `['flip', 'rotate', 'color']`).
    *   `augmentation_cap` (`Optional[int]`): An optional number that sets a maximum limit for the target count. If not provided, it defaults to the count of the most frequent class.

*   **Returns:**

    *   `Dict`: A dictionary containing the final report.
        *   Example: `{'initial_image_counts': {'0': 10, '1': 5}, 'final_image_counts': {'0': 10, '1': 10}, 'total_augmentations_applied': 5}`

### Augmentation Helper Functions

These functions each perform a specific visual transformation. They all share the same input/output structure.

*   **Functions:** `flip()`, `adjust_color()`, `rotate()`, `scale()`, `translate()`, `add_gaussian_blur()`, `cutout()`

*   **Shared Parameters (Inputs):**

    *   `img` (`numpy.ndarray`): The image (represented as a NumPy array) to be transformed.
    *   `bboxes` (`list`): A list of bounding boxes present on the image. Each box is itself a list like `[class_id, x_center, y_center, width, height]`.

*   **Shared Returns:**

    *   `Tuple`: A pair of `(transformed_image, transformed_bboxes)`, where `transformed_image` is the newly modified image and `transformed_bboxes` is the list of bounding boxes with their coordinates updated to match the new image.
