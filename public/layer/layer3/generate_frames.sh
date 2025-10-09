#!/bin/bash

# Script to generate optimized 360° frames from video for web display
# Usage: ./generate_frames.sh [video_file]

VIDEO_FILE=${1:-"dprkp.mp4"}

echo "🎬 Generating 360° frames from: $VIDEO_FILE"

# Check if video file exists
if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Error: Video file '$VIDEO_FILE' not found!"
    echo "Usage: ./generate_frames.sh [video_file]"
    exit 1
fi

# Remove old frames
echo "🧹 Cleaning old frames..."
rm -f frame_*.jpg

# Generate optimized frames for web
echo "⚡ Generating frames (800x600, 24fps, optimized for web)..."
ffmpeg -i "$VIDEO_FILE" -vf "scale=800:600,fps=24" -q:v 7 frame_%03d.jpg

# Count generated frames
FRAME_COUNT=$(ls frame_*.jpg 2>/dev/null | wc -l)

if [ $FRAME_COUNT -gt 0 ]; then
    echo "✅ Successfully generated $FRAME_COUNT frames!"
    echo "📁 Frames saved as: frame_001.jpg to frame_$(printf "%03d" $FRAME_COUNT).jpg"
    
    # Update LayerViewer component with new frame count
    echo "🔄 Updating frame count in LayerViewer..."
    LAYER_VIEWER_FILE="../../../src/components/LayerViewer.tsx"
    if [ -f "$LAYER_VIEWER_FILE" ]; then
        sed -i.bak "s/layer === 1 ? [0-9]* :/layer === 1 ? $FRAME_COUNT :/" "$LAYER_VIEWER_FILE"
        echo "✅ LayerViewer updated with $FRAME_COUNT frames"
    fi
else
    echo "❌ Error: No frames generated!"
    exit 1
fi

echo "🎉 Done! Ready for 360° web display"