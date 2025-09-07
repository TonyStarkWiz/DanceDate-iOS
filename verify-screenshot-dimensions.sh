#!/bin/bash

# Apple Watch Screenshot Dimension Verifier
# This script helps verify that your screenshots have the exact dimensions required by App Store Connect

echo "🔍 Apple Watch Screenshot Dimension Verifier"
echo "============================================"

# Check if ImageMagick is installed
if ! command -v identify &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    brew install imagemagick
fi

# Screenshot directory
SCREENSHOT_DIR="$HOME/Desktop/DanceDate-AppleWatch-Screenshots"

# Required dimensions
declare -A REQUIRED_DIMENSIONS=(
    ["410x502"]="Apple Watch Series 7/8/9 (45mm)"
    ["416x496"]="Apple Watch Series 7/8/9 (41mm)"
    ["396x484"]="Apple Watch Series 6 and earlier (44mm)"
    ["368x448"]="Apple Watch Series 6 and earlier (40mm)"
    ["312x390"]="Apple Watch Series 3 and earlier (38mm)"
)

echo "📁 Checking screenshots in: $SCREENSHOT_DIR"
echo ""

# Create directory if it doesn't exist
mkdir -p "$SCREENSHOT_DIR"

# Check if directory has any PNG files
if [ -z "$(ls -A "$SCREENSHOT_DIR"/*.png 2>/dev/null)" ]; then
    echo "⚠️  No PNG files found in $SCREENSHOT_DIR"
    echo "📝 Please capture screenshots first using the HTML mockups"
    echo ""
    echo "🚀 Opening pixel-perfect mockups..."
    open /Users/consultant/DanceDate-iOS/apple-watch-pixel-perfect.html
    exit 0
fi

echo "📊 Analyzing screenshots..."
echo ""

# Function to check dimensions
check_dimensions() {
    local file="$1"
    local dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "📸 $file: $dimensions"
        
        # Check if dimensions match any required size
        local found=false
        for required_dim in "${!REQUIRED_DIMENSIONS[@]}"; do
            if [ "$dimensions" = "$required_dim" ]; then
                echo "   ✅ Valid: ${REQUIRED_DIMENSIONS[$required_dim]}"
                found=true
                break
            fi
        done
        
        if [ "$found" = false ]; then
            echo "   ❌ Invalid dimensions! Required: 410x502, 416x496, 396x484, 368x448, or 312x390"
        fi
    else
        echo "❌ Error reading $file"
    fi
    echo ""
}

# Check all PNG files in the directory
for file in "$SCREENSHOT_DIR"/*.png; do
    if [ -f "$file" ]; then
        check_dimensions "$file"
    fi
done

echo "📋 Summary of Required Dimensions:"
echo "• 410 × 502px - Apple Watch Series 7/8/9 (45mm)"
echo "• 416 × 496px - Apple Watch Series 7/8/9 (41mm)"
echo "• 396 × 484px - Apple Watch Series 6 and earlier (44mm)"
echo "• 368 × 448px - Apple Watch Series 6 and earlier (40mm)"
echo "• 312 × 390px - Apple Watch Series 3 and earlier (38mm)"
echo ""

echo "💡 Tips for Perfect Screenshots:"
echo "1. Use browser developer tools 'Capture node screenshot'"
echo "2. Ensure no browser zoom (100% zoom level)"
echo "3. Use a high-DPI display for best results"
echo "4. Save as PNG format"
echo ""

echo "🚀 Opening pixel-perfect mockups for capture..."
open /Users/consultant/DanceDate-iOS/apple-watch-pixel-perfect.html
