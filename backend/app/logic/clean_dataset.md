# `clean_dataset.py` Documentation

## Overall Purpose

The main job of this script is to act as a "janitor" for a raw YOLO dataset. It takes a potentially messy dataset and cleans it up by performing several validation and standardization steps. This ensures that the data is reliable and in a consistent format before it's used for training or augmentation.

## How It Works (Core Logic)

The script follows a clear, step-by-step process for every image it finds:

1.  **Preparation:** It identifies the input folders (`images`, `labels`) and prepares the output folders (`images`, `labels`, and potentially `no_label`).
2.  **Image Check:** It attempts to open each image. If an image is corrupted or cannot be opened, it's discarded.
3.  **Label Validation:** For each valid image, it looks for a corresponding `.txt` label file.
    *   If a label file is found, it reads every line (each bounding box).
    *   For each bounding box, it checks if the class ID is valid (i.e., not a negative number and less than the total number of classes).
    *   Lines with invalid class IDs are discarded.
4.  **Sorting and Saving:** Based on the validation, the script decides where the image belongs:
    *   **If the image has at least one valid bounding box label,** it saves a standardized `.jpg` version of the image to the `output/images` folder and a cleaned version of the label file to `output/labels`.
    *   **If the image has no label file, an empty label file, or a label file with only invalid labels,** it's considered "unlabeled."
        *   If the user chose to **keep** unlabeled images, the image is saved as a `.jpg` to the `output/no_label` folder.
        *   If the user chose to **delete** unlabeled images, the script simply does nothing with the image, effectively removing it.
5.  **Final Report:** After checking all images, the script returns a dictionary containing statistics about the cleaning process, such as how many images were processed, removed, or saved.

---

## Functions Breakdown

This script contains one primary function that handles all the logic.

### `clean_dataset()`

This is the main function of the script. It orchestrates the entire cleaning process from start to finish.

*   **Parameters (Inputs):**

    *   `base_path` (`Path`): The path to the input directory containing the raw `images/` and `labels/` folders.
    *   `output_path` (`Path`): The path to the output directory where the cleaned dataset will be saved.
    *   `classes` (`List[str]`): A list of class names (e.g., `['dog', 'cat']`). This is used to determine the maximum valid class index.
    *   `remove_unlabeled_images` (`bool`): A true/false flag. If `True`, images without any valid labels will be deleted. If `False`, they will be saved to a `no_label` folder.

*   **Returns:**

    *   `Dict`: A dictionary containing a statistical summary of the cleaning process.
        *   Example: `{'images_processed': 100, 'corrupted_removed': 2, 'valid_images_saved': 90, ...}`
