#!/bin/bash

# Apple Watch Screenshot Generator for DanceDate
# This script helps create Apple Watch screenshots for App Store submission

echo "💃 DanceDate Apple Watch Screenshot Generator"
echo "=============================================="

# Apple Watch screenshot dimensions
echo "Apple Watch Screenshot Dimensions (App Store Required):"
echo "• 410 × 502px - Apple Watch Series 7/8/9 (45mm)"
echo "• 416 × 496px - Apple Watch Series 7/8/9 (41mm)"
echo "• 396 × 484px - Apple Watch Series 6 and earlier (44mm)"
echo "• 368 × 448px - Apple Watch Series 6 and earlier (40mm)"
echo "• 312 × 390px - Apple Watch Series 3 and earlier (38mm)"
echo ""

# Create screenshots directory
mkdir -p ~/Desktop/DanceDate-AppleWatch-Screenshots

echo "📁 Created directory: ~/Desktop/DanceDate-AppleWatch-Screenshots"
echo ""

# Instructions for creating screenshots
echo "📱 How to Create Apple Watch Screenshots:"
echo ""
echo "1. Open the HTML file:"
echo "   open /Users/consultant/DanceDate-iOS/apple-watch-mockups.html"
echo ""
echo "2. Use browser developer tools to capture screenshots:"
echo "   • Right-click on each Apple Watch mockup"
echo "   • Select 'Inspect Element'"
echo "   • Right-click on the .apple-watch element"
echo "   • Select 'Capture node screenshot'"
echo ""
echo "3. Alternative method using screenshot tools:"
echo "   • Use macOS Screenshot app (Cmd+Shift+4)"
echo "   • Select each Apple Watch mockup"
echo "   • Save with descriptive names"
echo ""
echo "4. Recommended screenshot names:"
echo "   • dancedate-watch-dashboard.png"
echo "   • dancedate-watch-events.png"
echo "   • dancedate-watch-match.png"
echo "   • dancedate-watch-messages.png"
echo "   • dancedate-watch-profile.png"
echo "   • dancedate-watch-notification.png"
echo ""

# Open the HTML file
echo "🚀 Opening Apple Watch mockups..."
open /Users/consultant/DanceDate-iOS/apple-watch-individual.html

echo "✅ Apple Watch mockups opened in your browser!"
echo "📝 Follow the instructions above to create your screenshots."
echo "🎯 Save screenshots to: ~/Desktop/DanceDate-AppleWatch-Screenshots"
