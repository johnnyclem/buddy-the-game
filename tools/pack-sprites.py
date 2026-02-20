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

# Output frame dimensions (every frame is resized to exactly this)
FRAME_W     = 320   # 640 / 2 = 320 (exact)
FRAME_H     = 434   # uniform target height for all frames

# Output layout
OUT_COLS    = 8     # frames per row in the packed sheet (one source image per row)

# ── Processing ──────────────────────────────────────────────────────────────

def extract_frames(img_path):
    """Extract all frames from a single source spritesheet.

    Slices at exact quarter-height boundaries, then resizes each frame
    to a uniform FRAME_W x FRAME_H so there are no sub-pixel offsets.
    """
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size

    if w != SRC_W or h != SRC_H:
        print(f"  WARNING: {os.path.basename(img_path)} is {w}x{h}, expected {SRC_W}x{SRC_H}")

    col_w = w // SRC_COLS  # 320 — divides exactly

    frames = []
    for row in range(SRC_ROWS):
        # Slice at exact quarter boundaries (handles the 434/435 split)
        y0 = round(row * h / SRC_ROWS)
        y1 = round((row + 1) * h / SRC_ROWS)

        for col in range(SRC_COLS):
            x0 = col * col_w
            x1 = x0 + col_w

            frame = img.crop((x0, y0, x1, y1))

            # Resize to uniform dimensions (handles 434 vs 435 row heights)
            if frame.size != (FRAME_W, FRAME_H):
                frame = frame.resize((FRAME_W, FRAME_H), Image.LANCZOS)

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
    print(f"Full-res frame size: {FRAME_W}x{FRAME_H}")

    # Downscale each frame individually to half-res BEFORE packing.
    # This avoids LANCZOS bleed across frame boundaries that happens
    # when you resize the whole packed sheet at once.
    half_fw = FRAME_W // 2   # 160
    half_fh = FRAME_H // 2   # 217
    half_frames = [f.convert('RGB').resize((half_fw, half_fh), Image.LANCZOS) for f in all_frames]

    # Pack into a grid: OUT_COLS columns, as many rows as needed
    out_rows = (total + OUT_COLS - 1) // OUT_COLS
    out_w = OUT_COLS * half_fw
    out_h = out_rows * half_fh

    print(f"Output: {out_w}x{out_h} ({OUT_COLS} cols x {out_rows} rows)")
    print(f"Output frame size: {half_fw}x{half_fh}")

    packed = Image.new('RGB', (out_w, out_h), (0, 0, 0))

    for i, frame in enumerate(half_frames):
        col = i % OUT_COLS
        row = i // OUT_COLS
        packed.paste(frame, (col * half_fw, row * half_fh))

    packed.save(OUTPUT, 'PNG', optimize=True)
    file_size = os.path.getsize(OUTPUT) / 1024 / 1024
    print(f"\nSaved: {OUTPUT}")
    print(f"  Dimensions: {out_w}x{out_h}")
    print(f"  Frames: {total} ({half_fw}x{half_fh} each)")
    print(f"  Grid: {OUT_COLS} cols x {out_rows} rows")
    print(f"  File size: {file_size:.1f} MB")
    print(f"\nTo use in intro-sprites.js:")
    print(f"  ['buddy-intro', 'assets/buddy-intro-packed.png', {half_fw}, {half_fh}, {OUT_COLS}, {out_rows}]")


if __name__ == '__main__':
    main()
