"""
Samanvay — Sign Language Model Training Pipeline
=================================================
Extracts hand landmarks from the ASL Alphabet dataset using MediaPipe,
trains a Dense neural network on the landmark coordinates, and exports
the model to TensorFlow.js format for browser inference.

Dataset: ASL Alphabet (Kaggle)
  - https://www.kaggle.com/datasets/grassknoted/asl-alphabet
  - 87,000 images across 29 classes (A-Z + space + del + nothing)
  - Download and extract to: training/data/asl_alphabet_train/

Usage:
  cd training
  pip install -r requirements.txt
  python train_sign_model.py

Output:
  ../public/models/sign_classifier/model.json  (+ .bin weight shards)
  labels.json                                  (class label mapping)
"""

import os
import json
import sys
import numpy as np
from pathlib import Path
from tqdm import tqdm
import cv2
import mediapipe as mp

# ── Configuration ──────────────────────────────────────────────────
DATA_DIR = Path("data/asl_alphabet_train")
OUTPUT_DIR = Path("../public/models/sign_classifier")
LABELS_FILE = Path("labels.json")

NUM_LANDMARKS = 21
NUM_FEATURES = NUM_LANDMARKS * 3  # x, y, z per landmark
BATCH_SIZE = 64
EPOCHS = 25
VALIDATION_SPLIT = 0.15
MAX_SAMPLES_PER_CLASS = 3000  # Cap to keep training fast. Set None for all.

KAGGLE_DATASET = "grassknoted/asl-alphabet"

# ── Step 0: Download Dataset ──────────────────────────────────────

def download_dataset():
    """Download the ASL Alphabet dataset using kagglehub."""
    try:
        import kagglehub
    except ImportError:
        print("❌ kagglehub not installed. Run: pip install kagglehub")
        sys.exit(1)

    print(f"📥 Downloading '{KAGGLE_DATASET}' via kagglehub...")
    print("   This may take a few minutes on first run...\n")

    dataset_path = Path(kagglehub.dataset_download(KAGGLE_DATASET))
    print(f"✅ Dataset at: {dataset_path}")

    # kagglehub caches the dataset; symlink/copy to our expected path
    target = DATA_DIR
    if not target.exists():
        # Look for the train folder inside the downloaded path
        train_dir = dataset_path / "asl_alphabet_train" / "asl_alphabet_train"
        if not train_dir.exists():
            train_dir = dataset_path / "asl_alphabet_train"
        if not train_dir.exists():
            train_dir = dataset_path  # flat structure

        target.parent.mkdir(parents=True, exist_ok=True)

        # Copy/symlink to expected location
        import shutil
        print(f"📁 Linking dataset to {target}...")
        try:
            os.symlink(str(train_dir), str(target))
        except (OSError, NotImplementedError):
            # Symlinks may fail on Windows without admin; just copy
            shutil.copytree(str(train_dir), str(target))

        print(f"✅ Dataset ready at {target}")


# ── Step 1: Extract Landmarks ──────────────────────────────────────

def extract_landmarks_from_dataset():
    """Extract hand landmarks from all images using MediaPipe."""

    cache_X = Path("cache_X.npy")
    cache_y = Path("cache_y.npy")
    cache_labels = Path("cache_labels.json")

    # Use cached landmarks if available (saves ~2 hours)
    if cache_X.exists() and cache_y.exists() and cache_labels.exists():
        print("\n📦 Loading cached landmarks...")
        X = np.load(cache_X)
        y = np.load(cache_y)
        with open(cache_labels) as f:
            label_names = json.load(f)
        print(f"   Loaded {len(X)} samples, {len(label_names)} classes")
        return X, y, label_names

    if not DATA_DIR.exists():
        print(f"\n📥 Dataset not found. Downloading via Kaggle API...")
        download_dataset()

    if not DATA_DIR.exists():
        print(f"\n❌ Dataset still not found at: {DATA_DIR.resolve()}")
        sys.exit(1)

    classes = sorted([d for d in DATA_DIR.iterdir() if d.is_dir()])
    if len(classes) == 0:
        print(f"❌ No class folders found in {DATA_DIR}")
        sys.exit(1)

    label_map = {cls.name: idx for idx, cls in enumerate(classes)}
    label_names = [cls.name for cls in classes]

    print(f"\n📂 Found {len(classes)} classes: {', '.join(label_names)}")

    # Save label mapping
    with open(LABELS_FILE, "w") as f:
        json.dump(label_names, f)
    print(f"💾 Saved labels to {LABELS_FILE}")

    # Initialize MediaPipe Hands (new Tasks API)
    import urllib.request
    from mediapipe.tasks.python import BaseOptions
    from mediapipe.tasks.python.vision import (
        HandLandmarker,
        HandLandmarkerOptions,
        RunningMode,
    )

    model_path = Path("hand_landmarker.task")
    if not model_path.exists():
        print("📥 Downloading hand landmarker model...")
        urllib.request.urlretrieve(
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            str(model_path),
        )

    options = HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(model_path)),
        running_mode=RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
    )

    landmarker = HandLandmarker.create_from_options(options)

    all_landmarks = []
    all_labels = []
    skipped = 0

    for cls_dir in tqdm(classes, desc="Processing classes"):
        images = list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.png"))

        if MAX_SAMPLES_PER_CLASS:
            images = images[:MAX_SAMPLES_PER_CLASS]

        for img_path in tqdm(images, desc=f"  {cls_dir.name}", leave=False):
            img = cv2.imread(str(img_path))
            if img is None:
                skipped += 1
                continue

            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
            result = landmarker.detect(mp_image)

            if result.hand_landmarks and len(result.hand_landmarks) > 0:
                hand = result.hand_landmarks[0]
                landmarks = normalize_landmarks(hand)
                all_landmarks.append(landmarks)
                all_labels.append(label_map[cls_dir.name])
            else:
                skipped += 1

    landmarker.close()

    X = np.array(all_landmarks, dtype=np.float32)
    y = np.array(all_labels, dtype=np.int32)

    print(f"\n✅ Extracted {len(X)} landmark samples ({skipped} images skipped)")
    print(f"   Shape: X={X.shape}, y={y.shape}")

    # Cache for next time
    np.save(cache_X, X)
    np.save(cache_y, y)
    with open(cache_labels, 'w') as f:
        json.dump(label_names, f)
    print(f"💾 Cached landmarks for next run")

    return X, y, label_names


def normalize_landmarks(landmarks):
    """
    Normalize landmarks to be wrist-centered and scale-invariant.
    Same normalization MUST be applied in the browser.
    """
    coords = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])

    # Center on wrist (landmark 0)
    wrist = coords[0].copy()
    coords -= wrist

    # Scale invariant: normalize by the max distance from wrist
    max_dist = np.max(np.linalg.norm(coords, axis=1))
    if max_dist > 0:
        coords /= max_dist

    return coords.flatten()


# ── Step 2: Train Model ───────────────────────────────────────────

def train_model(X, y, num_classes):
    """Train a Dense neural network on landmark features."""
    import tensorflow as tf
    from sklearn.model_selection import train_test_split

    print(f"\n🧠 Training model...")
    print(f"   Features: {X.shape[1]}")
    print(f"   Classes: {num_classes}")
    print(f"   Samples: {len(X)}")

    # Filter out classes with too few samples for stratified splitting.
    # stratify requires at least ceil(1/test_size) samples per class;
    # we add a safety margin on top of that.
    from collections import Counter
    import math
    counts = Counter(y)
    min_for_split = math.ceil(1.0 / VALIDATION_SPLIT) + 1  # e.g. 8 for 0.15
    min_samples = max(min_for_split, 5)
    valid_classes = {cls for cls, cnt in counts.items() if cnt >= min_samples}
    invalid_classes = {cls: cnt for cls, cnt in counts.items() if cnt < min_samples}
    mask = np.array([label in valid_classes for label in y])

    if invalid_classes:
        # Load label names to show readable class names
        try:
            with open(LABELS_FILE) as f:
                all_label_names = json.load(f)
        except Exception:
            all_label_names = None

        print(f"\n   ⚠️ Removing {len(invalid_classes)} class(es) with < {min_samples} samples:")
        for cls_idx, cnt in sorted(invalid_classes.items()):
            name = all_label_names[cls_idx] if all_label_names and cls_idx < len(all_label_names) else f"idx={cls_idx}"
            print(f"      - '{name}' → {cnt} sample(s)")

        X = X[mask]
        y = y[mask]
        # Re-map labels to contiguous indices
        unique_labels = sorted(set(y))
        remap = {old: new for new, old in enumerate(unique_labels)}
        y = np.array([remap[label] for label in y])
        num_classes = len(unique_labels)
        print(f"   Remaining: {num_classes} classes, {len(X)} samples")

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=VALIDATION_SPLIT, random_state=42, stratify=y
    )

    # One-hot encode labels
    y_train_oh = tf.keras.utils.to_categorical(y_train, num_classes)
    y_val_oh = tf.keras.utils.to_categorical(y_val, num_classes)

    # Build model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(NUM_FEATURES,)),
        tf.keras.layers.Dense(256, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(num_classes, activation='softmax'),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy'],
    )

    model.summary()

    # Train
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=3, factor=0.5, verbose=1),
    ]

    history = model.fit(
        X_train, y_train_oh,
        validation_data=(X_val, y_val_oh),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    # Evaluate
    val_loss, val_acc = model.evaluate(X_val, y_val_oh, verbose=0)
    print(f"\n📊 Validation accuracy: {val_acc:.4f}")
    print(f"📊 Validation loss: {val_loss:.4f}")

    return model


# ── Step 3: Export to TensorFlow.js ────────────────────────────────

def export_to_tfjs(model):
    """Export the trained model to TensorFlow.js format."""
    import tensorflowjs as tfjs

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"\n📦 Exporting model to TensorFlow.js...")
    tfjs.converters.save_keras_model(model, str(OUTPUT_DIR))
    print(f"   Saved to: {OUTPUT_DIR.resolve()}")

    # Copy labels to public dir too
    labels_dest = OUTPUT_DIR / "labels.json"
    with open(LABELS_FILE, 'r') as f:
        labels = json.load(f)
    with open(labels_dest, 'w') as f:
        json.dump(labels, f)
    print(f"   Labels: {labels_dest}")

    # Print model size
    total_size = sum(f.stat().st_size for f in OUTPUT_DIR.iterdir() if f.is_file())
    print(f"   Total size: {total_size / 1024:.1f} KB")


# ── Main ───────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Samanvay — Sign Language Model Training Pipeline")
    print("=" * 60)

    # Step 1: Extract landmarks
    X, y, label_names = extract_landmarks_from_dataset()

    # Step 2: Train
    model = train_model(X, y, len(label_names))

    # Step 3: Export
    export_to_tfjs(model)

    print("\n" + "=" * 60)
    print("  ✅ Training complete!")
    print(f"  Model ready at: {OUTPUT_DIR.resolve()}")
    print(f"  Classes: {len(label_names)}")
    print(f"  Now run 'npm run dev' — the model loads automatically.")
    print("=" * 60)


if __name__ == "__main__":
    main()
