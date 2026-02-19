#!/usr/bin/env python3
"""
pack-sprites.py — Extract frames from buddy-intro-*.png spritesheets
and pack them into a single clean spritesheet for the game engine.

Each source image is 640x1738 containing a 2-col x 4-row grid of frames.
Since 1738 doesn't divide evenly by 4, we crop each frame to 320x434
(the largest even size that fits) from calculated grid positions.

Output: assets/buddy-intro-packed.png — a single horizontal strip of all frames.

Usage:
    python3 tools/pack-sprites.py
"""

import os
import sys
import glob

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Install with: pip3 install Pillow")
    sys.exit(1)

# ── Configuration ───────────────────────────────────────────────────────────

ASSETS_DIR  = os.path.join(os.path.dirname(__file__), '..', 'assets')
PATTERN     = os.path.join(ASSETS_DIR, 'buddy-intro-*.png')
OUTPUT      = os.path.join(ASSETS_DIR, 'buddy-intro-packed.png')

# Source grid: 2 columns x 4 rows in a 640x1738 image
SRC_COLS    = 2
SRC_ROWS    = 4
SRC_W       = 640
SRC_H       = 1738

# Frame dimensions (cropped to clean even size)
FRAME_W     = 320   # 640 / 2 = 320 (exact)
FRAME_H     = 434   # 1738 / 4 = 434.5, we use 434 and center-crop

# Row height used for offset calculation (use 434.5 to center between frames)
ROW_STEP    = SRC_H / SRC_ROWS  # 434.5

# Output layout
OUT_COLS    = 8     # frames per row in the packed sheet (one source image per row)

# ── Processing ──────────────────────────────────────────────────────────────

def extract_frames(img_path):
    """Extract all frames from a single source spritesheet."""
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size

    if w != SRC_W or h != SRC_H:
        print(f"  WARNING: {os.path.basename(img_path)} is {w}x{h}, expected {SRC_W}x{SRC_H}")

    frames = []
    for row in range(SRC_ROWS):
        for col in range(SRC_COLS):
            # Calculate crop box, centering within the approximate cell
            x0 = col * FRAME_W
            y0 = round(row * ROW_STEP + (ROW_STEP - FRAME_H) / 2)
            x1 = x0 + FRAME_W
            y1 = y0 + FRAME_H

            # Clamp to image bounds
            y0 = max(0, y0)
            y1 = min(h, y1)

            frame = img.crop((x0, y0, x1, y1))

            # If we got a slightly short frame due to clamping, pad it
            if frame.size[1] < FRAME_H:
                padded = Image.new('RGBA', (FRAME_W, FRAME_H), (0, 0, 0, 0))
                padded.paste(frame, (0, 0))
                frame = padded

            frames.append(frame)

    return frames


def main():
    source_files = sorted(f for f in glob.glob(PATTERN) if 'packed' not in f)
    if not source_files:
        print(f"No files matching {PATTERN}")
        sys.exit(1)

    print(f"Found {len(source_files)} source spritesheets")

    all_frames = []
    for path in source_files:
        name = os.path.basename(path)
        frames = extract_frames(path)
        print(f"  {name}: extracted {len(frames)} frames")
        all_frames.extend(frames)

    total = len(all_frames)
    print(f"\nTotal frames: {total}")
    print(f"Frame size: {FRAME_W}x{FRAME_H}")

    # Pack into a grid: OUT_COLS columns, as many rows as needed
    out_rows = (total + OUT_COLS - 1) // OUT_COLS
    out_w = OUT_COLS * FRAME_W
    out_h = out_rows * FRAME_H

    print(f"Output: {out_w}x{out_h} ({OUT_COLS} cols x {out_rows} rows)")

    packed = Image.new('RGBA', (out_w, out_h), (0, 0, 0, 0))

    for i, frame in enumerate(all_frames):
        col = i % OUT_COLS
        row = i // OUT_COLS
        packed.paste(frame, (col * FRAME_W, row * FRAME_H))

    # Downscale to half-res for faster web loading (~4MB vs ~11MB)
    half_w = out_w // 2
    half_h = out_h // 2
    half_fw = FRAME_W // 2
    half_fh = FRAME_H // 2
    packed_rgb = packed.convert('RGB')
    packed_half = packed_rgb.resize((half_w, half_h), Image.LANCZOS)

    packed_half.save(OUTPUT, 'PNG', optimize=True)
    file_size = os.path.getsize(OUTPUT) / 1024 / 1024
    print(f"\nSaved: {OUTPUT}")
    print(f"  Dimensions: {half_w}x{half_h} (half-res from {out_w}x{out_h})")
    print(f"  Frames: {total} ({half_fw}x{half_fh} each)")
    print(f"  Grid: {OUT_COLS} cols x {out_rows} rows")
    print(f"  File size: {file_size:.1f} MB")
    print(f"\nTo use in intro-sprites.js:")
    print(f"  ['buddy-intro', 'assets/buddy-intro-packed.png', {half_fw}, {half_fh}, {OUT_COLS}, {out_rows}]")


if __name__ == '__main__':
    main()
