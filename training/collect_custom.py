"""
Samanvay — Custom Sign Data Collector
=======================================
Collect your own sign language training data using your webcam.
Perfect for adding ISL-specific signs that aren't in the ASL dataset.

Usage:
  python collect_custom.py

Controls:
  SPACE  — Start/stop recording samples for the current sign
  N      — Next sign (enter new label)
  Q      — Quit and save
  
Output:
  data/custom/landmarks.npy — Landmark data
  data/custom/labels.npy    — Label indices
  data/custom/label_map.json — Label name mapping
"""

import os
import json
import numpy as np
import cv2
import mediapipe as mp
from pathlib import Path

CUSTOM_DIR = Path("data/custom")
SAMPLES_PER_SIGN = 200
NUM_LANDMARKS = 21


def normalize_landmarks(landmarks):
    """Same normalization as train_sign_model.py."""
    coords = np.array([[lm.x, lm.y, lm.z] for lm in landmarks])
    wrist = coords[0].copy()
    coords -= wrist
    max_dist = np.max(np.linalg.norm(coords, axis=1))
    if max_dist > 0:
        coords /= max_dist
    return coords.flatten()


def main():
    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.5,
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return

    all_landmarks = []
    all_labels = []
    label_map = {}
    current_label_idx = 0
    recording = False
    count = 0

    # Load existing data if available
    landmarks_file = CUSTOM_DIR / "landmarks.npy"
    labels_file = CUSTOM_DIR / "labels.npy"
    map_file = CUSTOM_DIR / "label_map.json"

    if landmarks_file.exists():
        all_landmarks = list(np.load(landmarks_file))
        all_labels = list(np.load(labels_file))
        with open(map_file) as f:
            label_map = json.load(f)
        current_label_idx = len(label_map)
        print(f"📂 Loaded {len(all_landmarks)} existing samples, {len(label_map)} classes")

    current_sign = input("\n🤟 Enter the name of the first sign to record: ").strip()
    if current_sign not in label_map:
        label_map[current_sign] = current_label_idx
        current_label_idx += 1

    print(f"\n📹 Webcam ready!")
    print(f"   Recording sign: '{current_sign}'")
    print(f"   Press SPACE to start/stop recording")
    print(f"   Press N for next sign, Q to quit\n")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        # Draw landmarks
        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            if recording:
                lm = normalize_landmarks(result.multi_hand_landmarks[0].landmark)
                all_landmarks.append(lm)
                all_labels.append(label_map[current_sign])
                count += 1

        # UI overlay
        color = (0, 0, 255) if recording else (200, 200, 200)
        status = f"RECORDING ({count})" if recording else "PAUSED"
        cv2.putText(frame, f"Sign: {current_sign}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(frame, status, (10, 65),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        cv2.putText(frame, f"Total: {len(all_landmarks)} samples | {len(label_map)} signs",
                    (10, frame.shape[0] - 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1)
        cv2.putText(frame, "SPACE=Record | N=Next | Q=Quit",
                    (10, frame.shape[0] - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (150, 150, 150), 1)

        if recording:
            cv2.circle(frame, (frame.shape[1] - 30, 30), 12, (0, 0, 255), -1)

        cv2.imshow("Samanvay Data Collector", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord(' '):
            recording = not recording
            if recording:
                count = 0
                print(f"  ▶ Recording '{current_sign}'...")
            else:
                print(f"  ⏸ Paused. Recorded {count} samples for '{current_sign}'")

        elif key == ord('n'):
            recording = False
            save_data(all_landmarks, all_labels, label_map)
            current_sign = input(f"\n🤟 Enter the name of the next sign: ").strip()
            if current_sign not in label_map:
                label_map[current_sign] = current_label_idx
                current_label_idx += 1
            count = 0
            print(f"   Ready to record '{current_sign}'. Press SPACE to start.")

        elif key == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    hands.close()

    save_data(all_landmarks, all_labels, label_map)
    print(f"\n✅ Saved {len(all_landmarks)} total samples across {len(label_map)} signs")
    print(f"   Data at: {CUSTOM_DIR.resolve()}")


def save_data(landmarks, labels, label_map):
    """Save collected data to disk."""
    if len(landmarks) == 0:
        return

    CUSTOM_DIR.mkdir(parents=True, exist_ok=True)
    np.save(CUSTOM_DIR / "landmarks.npy", np.array(landmarks, dtype=np.float32))
    np.save(CUSTOM_DIR / "labels.npy", np.array(labels, dtype=np.int32))
    with open(CUSTOM_DIR / "label_map.json", "w") as f:
        json.dump(label_map, f, indent=2)


if __name__ == "__main__":
    main()
